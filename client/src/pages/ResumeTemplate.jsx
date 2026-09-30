import {
  BsEnvelope,
  BsGeoAlt,
  BsGlobeCentralSouthAsia,
  BsMortarboard,
  BsPersonWorkspace,
  BsPrinter,
  BsTelephone,
} from 'react-icons/bs'
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const profile = {
  name: 'Mansi Yadav',
  title: 'Yoga Instructor',
  about:
    'Creative yoga teacher with 3 years of experience in power and restorative yoga. Strong knowledge of breathing techniques, postures, and the spiritual foundations of yoga, with a sincere commitment to helping learners of all ages and backgrounds discover healthier routines and inner peace.',
  contact: [
    { icon: <BsTelephone size={16} />, label: 'Phone', value: '7017569430', href: 'tel:7017569430' },
    { icon: <BsEnvelope size={16} />, label: 'Email', value: 'my0342531@gmail.com', href: 'mailto:my0342531@gmail.com' },
    { icon: <BsGeoAlt size={16} />, label: 'Address', value: 'MIG B-212, Aashiyana Phase-1, MBD' },
  ],
  skills: [
    'Practical experience with physiotherapy machines',
    'Pranayama and meditation techniques',
    'Rehabilitation exercises',
    'Hatha yoga',
  ],
  languages: ['English', 'Hindi'],
  education: [
    {
      years: '2024 - 2026',
      institute: 'C.C.S University, Meerut',
      course: 'B.P.Ed',
    },
    {
      years: '2021 - 2024',
      institute: 'University of Patanjali',
      course: 'Bachelor of Yoga Science',
    },
    {
      years: '2021',
      institute: 'R.R.K School, Moradabad',
      course: 'Class 12, CBSE Board',
    },
    {
      years: '2019',
      institute: 'R.R.K School, Moradabad',
      course: 'Class 10, CBSE Board',
    },
  ],
  experience: [
    {
      duration: '3 Months Internship',
      role: 'Yoga & Wellness Intern',
      details: [
        'Supported yoga classes and guided participants through foundational postures and breathing practices.',
        'Observed and assisted with panchakarma and naturopathy-based wellness routines.',
        'Worked with rehabilitation-focused exercise support and physiotherapy machine handling.',
      ],
    },
  ],
}

const ResumeTemplate = () => {
  const navigate = useNavigate();

  return (
    <div className='min-h-screen bg-[#0B0F17] flex flex-col font-sans'>
      <div className="print:hidden">
        <Navbar />
      </div>

      <div className='flex-1 bg-[#efebe4] px-4 py-6 sm:px-6 lg:px-8 print:bg-white print:px-0 print:py-0'>
        <div className='mx-auto mb-4 flex max-w-5xl justify-between items-center print:hidden'>
          <button
            type='button'
            onClick={() => navigate('/career-hub')}
            className='bg-[#2f3437] text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-[#1a1d1f] transition'
          >
            ← Back to Career Hub
          </button>
          <button
            type='button'
            onClick={() => window.print()}
            className='bg-[#2f3437] text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-[#1a1d1f] transition flex items-center gap-2'
          >
            <BsPrinter size={16} />
            Print Resume
          </button>
        </div>

      <article className='mx-auto grid max-w-5xl overflow-hidden rounded-[28px] bg-white shadow-[0_18px_50px_rgba(60,52,43,0.16)] print:max-w-none print:rounded-none print:shadow-none lg:grid-cols-[320px_1fr]'>
        <aside className='bg-[#e8e1d7] px-7 py-8 text-[#2b2b2b] sm:px-8 sm:py-10'>
          <div className='flex flex-col items-start'>
            <div className='flex h-28 w-28 items-center justify-center rounded-full border-4 border-white bg-[#d7cdc0] text-[#6f6255] shadow-sm'>
              <FaRegUserCircle size={72} />
            </div>
          </div>

          <section className='mt-8'>
            <div className='mb-3 flex items-center gap-3'>
              <FaLeaf className='text-[#5f6f52]' size={18} />
              <h2 className='text-lg font-semibold'>About Me</h2>
            </div>
            <p className='text-sm leading-6 text-[#4d4a45]'>{profile.about}</p>
          </section>

          <section className='mt-8'>
            <div className='mb-3 flex items-center gap-3'>
              <BsTelephone className='text-[#5f6f52]' size={18} />
              <h2 className='text-lg font-semibold'>Contact</h2>
            </div>
            <div className='space-y-3 text-sm text-[#4d4a45]'>
              {profile.contact.map((item) => (
                <div key={item.label} className='flex items-start gap-3'>
                  <span className='mt-0.5 text-[#2f3437]'>{item.icon}</span>
                  {item.href ? (
                    <a href={item.href} className='break-all hover:text-black'>
                      {item.value}
                    </a>
                  ) : (
                    <span>{item.value}</span>
                  )}
                </div>
              ))}
            </div>
          </section>

          <section className='mt-8'>
            <div className='mb-3 flex items-center gap-3'>
              <BsPersonWorkspace className='text-[#5f6f52]' size={18} />
              <h2 className='text-lg font-semibold'>Skills</h2>
            </div>
            <ul className='space-y-2 pl-4 text-sm leading-6 text-[#4d4a45]'>
              {profile.skills.map((skill) => (
                <li key={skill} className='list-disc'>
                  {skill}
                </li>
              ))}
            </ul>
          </section>

          <section className='mt-8'>
            <div className='mb-3 flex items-center gap-3'>
              <BsGlobeCentralSouthAsia className='text-[#5f6f52]' size={18} />
              <h2 className='text-lg font-semibold'>Language</h2>
            </div>
            <ul className='space-y-2 pl-4 text-sm leading-6 text-[#4d4a45]'>
              {profile.languages.map((language) => (
                <li key={language} className='list-disc'>
                  {language}
                </li>
              ))}
            </ul>
          </section>
        </aside>

        <main className='px-7 py-8 sm:px-10 sm:py-10'>
          <header className='border-b border-[#e5e0d8] pb-6'>
            <p className='text-sm font-semibold uppercase tracking-[0.3em] text-[#8b806f]'>Resume</p>
            <h1 className='mt-3 text-4xl font-extrabold uppercase leading-none tracking-tight text-[#2f3437] sm:text-5xl'>
              {profile.name}
            </h1>
            <p className='mt-3 text-xl text-[#69645d]'>{profile.title}</p>
          </header>

          <section className='pt-8'>
            <div className='mb-5 flex items-center gap-3'>
              <BsMortarboard className='text-[#2f3437]' size={18} />
              <h2 className='text-2xl font-semibold text-[#2f3437]'>Education</h2>
            </div>
            <div className='space-y-5 border-l-2 border-[#ddd4c7] pl-5'>
              {profile.education.map((item) => (
                <div key={`${item.years}-${item.course}`} className='relative'>
                  <span className='absolute -left-[29px] top-1 h-3.5 w-3.5 rounded-full border-2 border-[#2f3437] bg-white' />
                  <p className='text-sm font-semibold text-[#2f3437]'>{item.years}</p>
                  <p className='mt-1 font-bold uppercase tracking-wide text-[#2f3437]'>{item.institute}</p>
                  <p className='text-sm text-[#5d5952]'>{item.course}</p>
                </div>
              ))}
            </div>
          </section>

          <section className='pt-10'>
            <div className='mb-5 flex items-center gap-3'>
              <BsPersonWorkspace className='text-[#2f3437]' size={18} />
              <h2 className='text-2xl font-semibold text-[#2f3437]'>Professional Experience</h2>
            </div>
            <div className='space-y-6 border-l-2 border-[#ddd4c7] pl-5'>
              {profile.experience.map((item) => (
                <div key={`${item.duration}-${item.role}`} className='relative'>
                  <span className='absolute -left-[29px] top-1 h-3.5 w-3.5 rounded-full border-2 border-[#2f3437] bg-white' />
                  <p className='text-sm font-semibold text-[#2f3437]'>{item.duration}</p>
                  <p className='mt-1 font-bold uppercase tracking-wide text-[#2f3437]'>{item.role}</p>
                  <ul className='mt-3 space-y-2 pl-4 text-sm leading-6 text-[#5d5952]'>
                    {item.details.map((detail) => (
                      <li key={detail} className='list-disc'>
                        {detail}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        </main>
      </article>
      </div>
      <div className="print:hidden">
        <Footer />
      </div>
    </div>
  )
}

export default ResumeTemplate
