export const interviewQuestions = [
  {
    id: "tell-me-about-yourself-1",
    text: "Tell me about yourself.",
    category: "Tell me about yourself",
    difficulty: "Beginner",
    timerSeconds: 90,
    suggestedAnswer:
      "Good day. My name is Maria Santos. I am a hardworking and friendly person who enjoys helping people. I may be new to the call center industry, but I am willing to learn, I can follow instructions, and I want to improve my English communication skills. I believe this role is a good opportunity for me to grow and support customers professionally.",
    structure: ["Greet the interviewer", "Share your name and strengths", "Mention that you are willing to learn", "Connect your answer to customer service"],
    tips: ["Keep it short and confident.", "Do not repeat your full resume.", "Smile while speaking so your voice sounds warmer."],
    mistakes: ["Sharing too many personal details", "Saying only your name and age", "Sounding memorized without energy"]
  },
  {
    id: "why-call-center-1",
    text: "Why do you want to work in a call center?",
    category: "Why call center?",
    difficulty: "Beginner",
    timerSeconds: 90,
    suggestedAnswer:
      "I want to work in a call center because I believe it is a good place to develop communication skills, patience, and professionalism. I enjoy helping people and solving problems. I also understand that BPO work can be challenging, but I am ready to learn and adjust to the work environment.",
    structure: ["Give your reason", "Mention skills you want to build", "Show realistic expectations", "End with willingness to learn"],
    tips: ["Show that you know the job involves helping customers.", "Be honest but professional.", "Avoid making salary your only reason."],
    mistakes: ["Saying it is easy work", "Focusing only on money", "Complaining about previous jobs"]
  },
  {
    id: "strengths-weaknesses-1",
    text: "What are your strengths and weaknesses?",
    category: "Strengths and weaknesses",
    difficulty: "Beginner",
    timerSeconds: 90,
    suggestedAnswer:
      "One of my strengths is that I am patient and willing to listen, which is important in customer service. I also try to stay calm when solving problems. For my weakness, I sometimes feel nervous when speaking English, but I practice by reading aloud and answering interview questions like this. I am working on improving every day.",
    structure: ["Name one job-related strength", "Give a simple example", "Share one manageable weakness", "Explain how you are improving"],
    tips: ["Choose a weakness that can improve with practice.", "Always include your action plan.", "Use customer service traits like patience and listening."],
    mistakes: ["Saying you have no weakness", "Choosing a weakness that sounds careless", "Giving a very long answer"]
  },
  {
    id: "angry-customer-1",
    text: "How would you handle an angry customer?",
    category: "Handling angry customers",
    difficulty: "Intermediate",
    timerSeconds: 90,
    suggestedAnswer:
      "I would stay calm and listen carefully without interrupting. I would apologize for the inconvenience and let the customer know that I understand their concern. Then I would ask the right questions, check the available information, and offer the best solution based on company policy. If needed, I would ask help from a supervisor.",
    structure: ["Stay calm", "Listen and acknowledge", "Apologize professionally", "Solve or escalate"],
    tips: ["Use empathy words like 'I understand'.", "Do not argue with the customer.", "Mention company policy and supervisor support."],
    mistakes: ["Blaming the customer", "Promising something you cannot do", "Taking the anger personally"]
  },
  {
    id: "shifting-schedule-1",
    text: "Are you willing to work on shifting schedules, weekends, and holidays?",
    category: "Shifting schedule",
    difficulty: "Beginner",
    timerSeconds: 60,
    suggestedAnswer:
      "Yes, I am willing to work on shifting schedules, weekends, and holidays. I understand that BPO operations usually support customers in different time zones. I will prepare my routine so I can report to work on time and stay productive during my shift.",
    structure: ["Answer directly", "Show that you understand BPO schedules", "Explain how you will adjust"],
    tips: ["Be clear and confident.", "Mention attendance and preparation.", "Only say yes if you can really commit."],
    mistakes: ["Sounding unsure", "Adding many conditions", "Saying yes then explaining why it is difficult"]
  },
  {
    id: "english-communication-1",
    text: "How do you rate your English communication skills?",
    category: "English communication",
    difficulty: "Beginner",
    timerSeconds: 90,
    suggestedAnswer:
      "I would rate my English communication skills as good for a beginner, and I am continuously improving. I can understand instructions, answer questions, and hold basic conversations. I practice speaking English every day so I can become more confident and natural when talking to customers.",
    structure: ["Give a realistic rating", "Mention what you can do", "Show daily practice", "Connect improvement to customer calls"],
    tips: ["Be honest but positive.", "Avoid rating yourself too low.", "Speak slowly and clearly."],
    mistakes: ["Apologizing too much for your English", "Using slang", "Giving only a number with no explanation"]
  },
  {
    id: "salary-expectation-1",
    text: "What is your salary expectation?",
    category: "Salary expectation",
    difficulty: "Intermediate",
    timerSeconds: 60,
    suggestedAnswer:
      "As a beginner, I am open to the company's salary package for entry-level candidates. I would also like to consider the full benefits, training, and growth opportunities. My priority is to start my BPO career and perform well in the role.",
    structure: ["Stay flexible", "Mention entry-level package", "Consider benefits", "Show career motivation"],
    tips: ["Keep the tone professional.", "Avoid giving a random high number.", "Mention total package, not salary alone."],
    mistakes: ["Saying 'any amount is okay'", "Demanding without experience", "Sounding like money is the only goal"]
  },
  {
    id: "final-interview-1",
    text: "Why should we hire you?",
    category: "Final interview questions",
    difficulty: "Intermediate",
    timerSeconds: 90,
    suggestedAnswer:
      "You should hire me because I am willing to learn, reliable, and serious about starting my BPO career. I understand that I still need training, but I am ready to listen, improve, and follow company standards. I believe my patience, positive attitude, and commitment can help me become a good customer service representative.",
    structure: ["Name your best qualities", "Acknowledge training", "Show commitment", "Connect to customer service"],
    tips: ["Sound confident, not arrogant.", "Use qualities that fit BPO work.", "End with commitment."],
    mistakes: ["Begging for the job", "Comparing yourself with other applicants", "Giving a vague answer"]
  }
];

export const categories = [...new Set(interviewQuestions.map((question) => question.category))];
