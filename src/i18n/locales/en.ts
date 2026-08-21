export default {
  intro: {
    title: 'Loading portfolio',
    enter: 'Enter portfolio',
  },
  nav: {
    experience: 'Experience',
    education: 'Education',
    projects: 'Projects',
    contact: 'Contact',
  },
  hero: {
    greeting: 'Hello, I am',
    ctaExperience: 'View experience',
  },
  profile: {
    role: 'Test Analyst/QA & Frontend Developer',
    location: 'Manaus/AM, Brazil 🏖',
    summary:
      'I develop frontend and backend test automation projects using Cypress, K6, Locust, and JavaScript/TypeScript for web applications.',
    contactMessage:
      "I'm currently available for new projects. Get in touch and let's schedule a conversation 👋",
  },
  experience: {
    title: 'Experience',
    items: [
      {
        company: 'NEOWAY',
        role: 'Mid-level Quality Analyst',
        period: 'Jun/2025 – Nov/2025',
        description:
          'Execution of functional and non-functional tests (manual and automated) on APIs, performance, stress, and load. Test automation with Cypress and K6, integration with Python/DuckDB for managing large volumes of data. Defect management in Jira, version control in GitLab, and regression testing with Jenkins and Docker. Data validation in Power BI.',
        skills: [
          'Manual Testing',
          'Automated Testing',
          'Continuous Integration Testing',
          'Functional Testing',
          'Non-Functional Testing',
          'API Testing',
          'Cypress',
          'K6',
          'JavaScript',
          'Python',
        ],
      },
      {
        company: 'ZDZCODE PJ',
        role: 'Mid-level Test/QA Analyst',
        period: 'Jan/2025 – May/2025',
        description:
          'Preparation of test plans and test suites, execution of manual functional and non-functional tests. Mentorship for junior QAs and monitoring of activities in Azure DevOps.',
        skills: ['Prepare Test Plan', 'Prepare Test Suite', 'Manual Testing', 'Functional Testing', 'Azure DevOps'],
      },
      {
        company: 'Grupo ICTS',
        role: 'Mid-level Test/QA Analyst',
        period: 'Sep/2022 – Oct/2024',
        description:
          'Functional and non-functional testing, manual testing, usability, performance, stress, both Frontend and Backend. API automation with Cypress and K6, validation with MongoDB. Defect management in QASE, Trello, and GitLab.',
        skills: ['Cypress Testing', 'K6 Testing', 'MongoDB', 'JavaScript/TypeScript', 'Functional Testing', 'Non-Functional Testing', 'Manual Testing', 'Automated Testing', 'Gitlab', 'Trello', 'QASE'],
      },
      {
        company: 'Grupo ICTS',
        role: 'Mid-level Frontend Developer Analyst',
        period: 'Mar/2021 – Sep/2022',
        description:
          'Creation of responsive interfaces with HTML5, CSS3, JavaScript, TypeScript, and Angular 10. Task management in Trello (Kanban). Version control in GitLab, merge request reviews, and release creation. Unit testing during development.',
        skills: ['Angular 10', 'Angular Material', 'HTML5', 'CSS3', 'Bootstrap', 'JavaScript/TypeScript', 'Trello', 'Gitlab', 'Unit Testing', 'Scrum and Kanban'],
      },
      {
        company: 'Grupo ICTS',
        role: 'Frontend Developer Intern',
        period: 'Nov/2020 – Feb/2021',
        description:
          'Creation of responsive interfaces with HTML5, CSS3, JavaScript, TypeScript, and Angular 10. Task management in Trello (Kanban). Unit testing and code version control in GitLab.',
        skills: ['Angular 10', 'Angular Material', 'HTML5', 'CSS3', 'Bootstrap', 'JavaScript/TypeScript', 'Trello', 'Gitlab', 'Unit Testing', 'Scrum and Kanban'],
      },
      {
        company: 'INDT',
        role: 'Intern',
        period: 'Nov/2018 – May/2020',
        description:
          'Blockchain development with Python (Proof of Work, hashlib, Web3.py, Solidity). Frontend with HTML5, CSS3, JavaScript, TypeScript, and Angular 6. Manual software testing and Ginga-NCL test automation with Lua.',
        skills: ['Angular 6', 'HTML5', 'CSS3', 'JavaScript/TypeScript', 'Trello', 'Gitlab', 'Unit Testing', 'Scrum and Kanban', 'NCL', 'Lua'],
      },
      {
        company: 'Tarkuss',
        role: 'Web Developer',
        period: 'Aug/2018 – Oct/2018',
        description: 'Frontend interface development with HTML5, CSS3, JavaScript, and Bootstrap, creating responsive layouts and optimizing performance.',
        skills: ['HTML5', 'CSS3', 'JavaScript', 'Bootstrap'],
      },
    ],
  },
  education: {
    title: 'Education',
    description:
      'My most recent academic experience was a Postgraduate degree 🎓 at Faveni. I also keep myself up to date with intensive online courses.',
    academicTitle: 'Academic Background',
    degrees: [
      { title: "Bachelor's Degree in Information Systems", period: '' },
      { title: 'MBA – Software Quality Management', school: 'Faveni', period: '2024 – 2025' },
    ],
    skillsTitle: 'Technical Skills',
    skills: [
      'Languages: JavaScript, TypeScript, Python (Basic), Java (Basic), C# (Basic)',
      'Test Automation: Cypress, K6, Playwright, Locust, Robot Framework, Rest Assured',
      'Databases & Tools: PostgreSQL, MongoDB, DBeaver',
      'APIs & Tools: Postman, Insomnia, Swagger',
      'DevOps & Version Control: Git, GitLab, Docker, GitHub Actions, Jenkins',
      'Methodology: Scrum, Kanban',
      'Frontend: HTML5, CSS3, Bootstrap, Angular, Angular Material, Vue (Basic)',
    ],
    coursesTitle: 'Intensive Courses',
    courses: [
      { title: 'Cypress - Expert Level', provider: 'Ninja do Cypress' },
      { title: 'Cypress - Advanced Level', provider: 'Ninja do Cypress' },
      { title: 'Cypress - Foundations Level', provider: 'Ninja do Cypress' },
      { title: 'Manual Software Testing: From Planning to Execution', provider: 'Udemy' },
      { title: 'Master Pytest: Software Testing with Python', provider: 'Udemy' },
      { title: 'Testing Modern Applications with Cypress', provider: 'Udemy' },
      { title: 'Web Automation – Cypress and Cucumber', provider: 'Udemy' },
      { title: 'End-to-End Testing with Cypress', provider: 'Udemy' },
      { title: 'Dual Experience with Cypress and CodeceptJS', provider: 'Udemy' },
      { title: 'Continuous Testing in Cypress with GitHub Actions', provider: 'Udemy' },
      { title: 'Testing REST API with MongoDB and RabbitMQ in Cypress', provider: 'Udemy' },
      { title: 'Playwright eXpress', provider: 'Udemy' },
      { title: 'JavaScript for QAs', provider: 'QAxperience' },
    ],
    languagesTitle: 'Languages',
    languages: ['English / Intermediate – In progress'],
  },
  projects: {
    title: 'Projects on GitHub',
    subtitle: 'Projects on my GitHub for frontend & backend test automation.',
    items: [
      { title: 'Automated Testing - Frontend & Backend', subtitle: 'QA Automation with Cypress', url: 'https://github.com/ErictonFelicidade86/QA_Automation' },
      { title: 'Test Automation Training with Cypress', subtitle: 'Testing API with Cypress', url: 'https://github.com/ErictonFelicidade86/Testando-API-com-Cypress' },
      { title: 'Automating Website with Cypress', subtitle: 'Automation with Cypress', url: 'https://github.com/ErictonFelicidade86/automatizando-website-cypress' },
      { title: 'Cypress Cucumber GitHub Action Web', subtitle: 'Automation with Cypress, Cucumber, and GitHub Actions', url: 'https://github.com/ErictonFelicidade86/cypress-cucumber-github-action-web' },
      { title: 'Automated Testing with Cypress', subtitle: 'Cypress with Page Object Model', url: 'https://github.com/ErictonFelicidade86/desafio-qa' },
      { title: 'Automated Testing - API', subtitle: 'Testing with Cypress and K6', url: 'https://github.com/ErictonFelicidade86/Neoway' },
      { title: 'Test Automation with Cypress and K6', subtitle: 'Automated Testing Frontend & Backend', url: 'https://github.com/ErictonFelicidade86/desafio_Eng_QA_PL' },
      { title: 'Test Portfolio', subtitle: 'My Portfolio', url: 'https://github.com/ErictonFelicidade86/portfolio-em-teste' },
    ],
  },
  contact: {
    title: 'Contact',
    developedBy: 'Developed by {name}.',
  },
}
