import fs from 'fs'
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import { askAi } from '../services/openRouter.service.js';
import User from '../models/userModel.js'
import Interview from '../models/interviewModel.js'
import { create } from 'domain';

const parseAiJson = (rawContent) => {
    if (!rawContent || typeof rawContent !== "string") {
        throw new Error("AI returned invalid JSON content.");
    }

    const cleaned = rawContent
        .trim()
        .replace(/^```json\s*/i, "")
        .replace(/^```\s*/i, "")
        .replace(/\s*```$/i, "")
        .trim();

    try {
        return JSON.parse(cleaned);
    } catch (error) {
        throw new Error(`AI returned non-JSON response: ${cleaned.slice(0, 200)}`);
    }
};


export const analyzeResume = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "Resume required" });
        }
        const filepath = req.file.path;

        const fileBuffer = await fs.promises.readFile(filepath);
        const uint8Array = new Uint8Array(fileBuffer);

        const pdf = await pdfjsLib.getDocument({ data: uint8Array }).promise;

        let resumeText = "";

        // Extract text from all pages
        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
            const page = await pdf.getPage(pageNum);
            const content = await page.getTextContent();

            const pageText = content.items.map((item) => item.str || "").join(" ");
            resumeText += `${pageText}\n`;
        }


        resumeText = resumeText
          .replace(/\s+/g, " ")
           .trim();
        
           // prompt
           const messages = [
            {
                role: "system",
                content:`
                Extract strutured data from resume.
                
                Return strictly JSON:

                {
                "role": "string",
                "experience": "string",
                "projects": ["project1","project2"],
                "skills": ["skill1","skill2"]
                }
                `
                   },
                   {
                    role:"user",
                    content: resumeText
                  }
           ];

           const aiResponse = await askAi(messages);

           const parsed = parseAiJson(aiResponse);

           fs.unlinkSync(filepath);


           res.json({
            role: parsed.role,
            experience: parsed.experience,
            projects: parsed.projects,
            skills:parsed.skills,
            resumeText
           });

    } catch (error) {
        console.error(error);

        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }

       return res.status(500).json({ message: error.message });
    }
};


export const generateQuestion = async (req, res) => {
    try {
        const { role, experience, mode, resumeText, projects, skills } = req.body;

        const normalizedRole = role?.trim();
        const normalizedExperience = experience?.trim();
        const normalizedMode = mode?.trim();

        if (!normalizedRole || !normalizedExperience || !normalizedMode) {
            return res.status(400).json({ message: "Role, experience and mode are required." });
        }

        const user = await User.findById(req.userId);

        if (!user) {
            return res.status(404).json({
                message: "User not found."
            });
        }

        if (user.credits < 50) {
            return res.status(400).json({
                message: "Not enough credits. Minimum 50 required."
            });
        }

        const projectText = Array.isArray(projects) && projects.length 
        ? projects.join(", ")
        : "None";

        const skillsText = Array.isArray(skills) && skills.length
        ? skills.join(",")
        : "None";

        const safeResume = resumeText?.trim() || "None";

        // user prompt

        const userPrompt = `
        Role:${normalizedRole}
        Experience:${normalizedExperience}
        Interview Mode:${normalizedMode}
        Projects:${projectText}
        Skills:${skillsText}
        Resume:${safeResume}
        `;


        if (!userPrompt.trim()){
            return res.status(400).json({
                message: "Prompt content is empty."
            })
        }

        const messages = [
            {
                role: "system",
                content:`
                You are a real human interviewer conducting a proffesional interview.
                
                Speak in simple, natural English as if you are directly talking to the candidate.

                Generate exactly 5 interview questions.

                Strict Rules:
                - Each question must contain between 15 and 25 words.
                - Each question must be a single complete sentence.
                - Do NOT number them.
                - Do NOT add explanations.
                - Do NOT add extra text before or after.
                - One question per line only.
                - Keep language simple and conversational.
                - Questions must feel practical and realistics.

                Difficulty progression:
                Question 1 -> easy
                Question 2 -> easy
                Question 3 -> medium
                Question 4 -> medium
                Question 5 -> Hard

                Make questions based on the candidate's role, experience, interviewMode, projects, skills, and resume details.
                `
            },
            {
                role:"user",
                content:userPrompt
            }
        ];

         const aiResponse = await askAi(messages);

         if (!aiResponse) {
            return res.status(500).json({
                message: "Failed to generate interview questions."
            });
         }
          const questionsArray = aiResponse
          .split("\n")
          .map(q => q.trim())
          .filter(q => q.length > 0)   
          .slice(0,5);

          if (questionsArray.length === 0) {
            return res.status(500).json({
                message: "AI failed to generate valid questions."
            });
          }


            // deduct credits
            user.credits -= 50;
            await user.save();

            const interview  = await Interview.create({
                userId: user._id,
                role: normalizedRole,
                experience: normalizedExperience,
                mode: normalizedMode,
                resumeText: safeResume,
                questions: questionsArray.map((q, index) => ({
                    question: q,
                    difficulty: ["easy", "easy", "medium", "medium", "hard"][index],
                    timeLimit: [60, 60, 90, 90, 120][index]
                }))
            });

             return res.json({
                interviewId: interview._id,
                creditsLeft: user.credits,
                userName: user.name,
                questions: interview.questions
         });

    } catch (error) {
        return res.status(500).json({
            message: `failed to create interview ${error.message}`
        });
    }
};


export const submitAnswer = async (req, res) => {
    try {

        const {interviewId, questionIndex, answer, timeTaken} = req.body;
        
        const interview = await Interview.findById(interviewId);
        const question = interview.questions[questionIndex];

        if(!answer) {
            question.score = 0;
            question.feedback = "You did not submit an aswer.";
            question.answer = "";

            await interview.save();

            return res.json({
                message: "Answer submitted successfully.",
                feedback: question.feedback,
            });
         }
        //  If time exceeded
        if (timeTaken > question.timeLimit) {
            question.score = 0;
            question.feedback = "Time limit exceeded. Answer not evaluated.";
            question.answer = answer;

            await interview.save();

            return res.json({
                message: "Answer submitted successfully.",
                feedback: question.feedback,
            });     
        }

        const messages = [
            {
                role: "system",
                content:`
                You are a professional human interviewer evaluating a candidate's answer in a real interview.

                Evaluate naturally and fairly, like a real person would.

                Score the answer in these areas(0 to 10).
                1. Confidence - Does the answer sound clear, confident, and well-presented?
                2. Communication - Is the language simple, clear, and easy to understand?
                3. Correctness - Is the answer accurate, relevant, and complete?

                Strict Rules:
                - Be realistic and unbiased.
                - Do not  give random high scores.
                - If the answer is strong and detailed, score high.
                - Consider clarity, structure, and relevance. 

               Calculate:
                Final Score = (Confidence + Communication + Correctness) / 3
                
                Feedback Rules:
                - Write natural human feedback.
                - 10 to 15 words only.
                - Sound like real interview feedback.
                - Can suggest improvemnet if needed.
                - Do NOT repeat the question.
                - Do NOT explain scoring.
                - Keep tone professional and honest.

                Return ONLY valid JSON in this format: 
                
                {
                        "Confidence": number,
                        "Communication": number,
                        "Correctness": number,
                        "FinalScore": number,
                        "Feedback": "short human feedback"
                }
                `
            },
            {
                role:"user",
                content:`
                Question: ${question.question}
                Answer: ${answer}
                `
            }
        ];

        const aiResponse = await askAi(messages);

        const parsed = parseAiJson(aiResponse);
        
        question.answer = answer;
        question.confidence = parsed.Confidence ?? 0;
        question.communication = parsed.Communication ?? 0;
        question.correctness = parsed.Correctness ?? 0;
        question.score = parsed.FinalScore ?? 0;
        question.feedback = parsed.Feedback || "No feedback generated.";
        await interview.save();

        return res.status(200).json({feedback: parsed.Feedback || "No feedback generated."});

    } catch (error) {
        return res.status(500).json({
            message: `failed to submit answer ${error.message}`
        });
    }
};   


export const finishInterview = async (req, res) => {
    try {
        
        const {interviewId} = req.body;

        const interview = await Interview.findById(interviewId);

        if (!interview) {
            return res.status(400).json({
                message: "Interview not found."
            });
        }

        const totalQuestions = interview.questions.length;

        let totalScore = 0;
        let totalConfidence = 0;
        let totalCommunication = 0;
        let totalCorrectness = 0;

        interview.questions.forEach(q => {
            totalScore += q.score || 0;
            totalConfidence += q.confidence || 0;
            totalCommunication += q.communication || 0;
            totalCorrectness += q.correctness || 0;
        });

        const finalScore = totalQuestions ? totalScore / totalQuestions : 0;

        const avgConfidence = totalQuestions ? totalConfidence / totalQuestions : 0;

        const avgCommunication = totalQuestions ? totalCommunication / totalQuestions : 0;

        const avgCorrectness = totalQuestions ? totalCorrectness / totalQuestions : 0;

        interview.finalScore = finalScore;
        interview.status = "completed";

        await interview.save();

        return res.status(200).json({
            interviewId: interview._id,
            finalScore:Number(finalScore.toFixed(1)),
            confidence: Number(avgConfidence.toFixed(1)),
            communication: Number(avgCommunication.toFixed(1)),
            correctness: Number(avgCorrectness.toFixed(1)),
            questionWiseScore: interview.questions.map((q) => ({
                question: q.question,
                score: q.score || 0,
                feedback: q.feedback || "",
                confidence: q.confidence || 0,
                communication: q.communication || 0,
                correctness: q.correctness || 0,
                
            }))

        });

    } catch (error) {
        return res.status(500).json({
            message: `failed to finished Interview ${error.message}`
        });
    }
}


export const getMyInterviews = async (req,res) => {
       try {
           const interview = await Interview.find({userId:req.userId})
           .sort({createdAt: -1})
          .select("role experience mode finalScore status createdAt");

          return res.status(200).json({interviews: interview});

       } catch (error) {
        return res.status(500).json({
            message: `failed to find currentUser Interview ${error.message}`
        });    
       }
}   



export const getInterviewReport = async (req,res) => {
    try {
        const interview = await Interview.findOne({_id: req.params.id, userId: req.userId});
        
        if (!interview) {
            return res.status(404).json({
                message: "Interview not found."
            });
        }

         const totalQuestions = interview.questions.length;

        let totalConfidence = 0;
        let totalCommunication = 0;
        let totalCorrectness = 0;

        interview.questions.forEach(q => {
            totalConfidence += q.confidence || 0;
            totalCommunication += q.communication || 0;
            totalCorrectness += q.correctness || 0;
        });


        const avgConfidence = totalQuestions ? totalConfidence / totalQuestions : 0;

        const avgCommunication = totalQuestions ? totalCommunication / totalQuestions : 0;

        const avgCorrectness = totalQuestions ? totalCorrectness / totalQuestions : 0;

        return res.json({
            role: interview.role,
            experience: interview.experience,
            mode: interview.mode,
            status: interview.status,
            createdAt: interview.createdAt,
            finalScore:Number((interview.finalScore || 0).toFixed(1)),
            confidence: Number(avgConfidence.toFixed(1)),
            communication: Number(avgCommunication.toFixed(1)),
            correctness: Number(avgCorrectness.toFixed(1)),
            questionWiseScore: interview.questions
        });

    } catch (error) {
        return res.status(500).json({
            message: `failed to find currentUser Interview ${error.message}`
        });
    }

}
