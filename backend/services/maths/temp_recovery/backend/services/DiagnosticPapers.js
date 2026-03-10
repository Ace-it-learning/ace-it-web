// Repository of 5 distinct Diagnostic Papers (Set A - Set E)
// Mimicking HKDSE Standards for a "Mini-Diagnostic" (15-20 mins)

const PAPERS = {
    // === SET A: YOUTH & SOCIETY ===
    'A': {
        reading: {
            // ~350-400 words
            passage: `(Social Issues) 'The Digital Activist Generation'\n\nWhile many critics dismiss modern youth activism as merely "clicktivism"—sharing posts without taking real action—the reality is far more nuanced. A recent study by the Hong Kong Youth Association revealed that 65% of students who engage with social causes online eventually participate in offline volunteering. \n\nTake the example of "FoodRescue," a student-led initiative that started as an Instagram hashtag. What began as sharing photos of wasted cafeteria food transformed into a city-wide network of volunteers collecting surplus meals for elderly homes. This demonstrates that digital platforms serve as a gateway, not a barrier, to civic engagement.\n\nHowever, the challenge lies in depth. The algorithm favors sensational visuals over complex policy discussions. Students might share a viral video about ocean plastic but lack the patience to read a ten-page report on waste management legislation. This "headline culture" can lead to superficial understanding, where passion outpaces knowledge.\n\nEducators argue that schools must bridge this gap. Instead of banning phones, teachers should encourage students to critically analyze the campaigns they follow. "We need to teach them to ask: Who funded this ad? what is the proposed solution?" says Dr. Lee, a sociologist at HKU. Ultimately, the phone is just a tool; whether it becomes a megaphone for change or a distraction depends on the hand that holds it.`,
            questions: [
                { id: 'r1', type: 'mc', text: "What did the 'FoodRescue' initiative originally start as?", options: ["A school club", "An Instagram hashtag", "A city-wide protest", "A government program"], answer: "An Instagram hashtag" },
                { id: 'r2', type: 'text', text: "According to the text, what is the main 'challenge' of digital activism?", answer: "Depth / Headline culture / Superficial understanding" },
                { id: 'r3', type: 'mc', text: "What does Dr. Lee suggest teachers should do?", options: ["Ban phones in class", "Create their own campaigns", "Encourage critical analysis", "Ignore social media"], answer: "Encourage critical analysis" },
                { id: 'r4', type: 'text', text: "Find a word in paragraph 2 that means 'extra' or 'excess'.", answer: "Surplus" },
                { id: 'r5', type: 'text', text: "Does the author believe social media prevents offline action? Explain.", answer: "No, the text says it serves as a gateway (65% eventually volunteer)." }
            ]
        },
        writing: {
            // Paper 2 Part A (Short Task)
            prompt: "The new academic year has just begun, and many Form 1 students are feeling nervous about adjusting to secondary school life. As the President of the Student Union, you have been asked to reach out to them. Write a welcome email to all new F.1 students to make them feel at home, introducing them to the supportive community at our school.",
            requirements: "Write about 150 words. Tone: Welcoming and Encouraging. Include: 1 upcoming activity.",
            topic: "Student Union Welcome Email"
        },
        listening: {
            // Script for TTS
            script: `(Podcast Intro: 'Future Skills')\n\nHost: "Welcome back. Today we're discussing 'Resilience'. My guest, Coach Wong, believes we are protecting kids too much. Coach?"\n\nCoach: "Exactly. I see parents rushing to fix every small problem for their child. If a student forgets their homework, the parent brings it to school. If they fail a test, the parent blames the teacher. But failure is data! When we remove the struggle, we remove the learning. We call this 'Snowplough Parenting'—clearing the road so the child never bumps into anything. But real life... real life is full of bumps."`,
            questions: [
                { id: 'l1', text: "What is the specific term Coach Wong uses for over-protective parents?", answer: "Snowplough Parenting" },
                { id: 'l2', text: "According to Coach Wong, what does he consider 'failure' to be?", answer: "Data" },
                { id: 'l3', text: "What happens when parents 'remove the struggle'?", answer: "They remove the learning / They miss the learning process" }
            ]
        },
        speaking: {
            // Paper 4 Part B choices
            topics: [
                "Your favourite way to relax after school",
                "A person who has influenced you the most",
                "Is it better to study alone or in a group?"
            ]
        }
    },

    // === SET B: TECHNOLOGY & EDUCATION ===
    'B': {
        reading: {
            passage: `(Technology) 'The AI Classroom'\n\nThe debate over Artificial Intelligence in schools has reached a fever pitch. On one side, traditionalists warn of a "cheating epidemic," fearing that students will use tools like ChatGPT to write essays without generating a single original thought. Many schools responded with immediate bans, blocking AI sites on campus Wi-Fi.\n\nYet, this reactionary approach ignores the reality of the modern workplace. "Banning AI is like banning calculators in the 80s," argues Sarah Chen, a technology consultant. "We are sending graduates into a world where AI proficiency is a required skill."\n\nForward-thinking schools are adopting a different strategy: integration. Instead of asking students to "Write an essay about WW2," they now ask, "Critique this AI-generated essay about WW2." This shift forces students to become editors and fact-checkers, requiring a higher level of subject mastery to identify the AI's hallucinations or biases.\n\nThe danger isn't the tool; it's the stagnation of our assessment methods. If a robot can pass our exams, perhaps the problem lies with the exams, not the robot.`,
            questions: [
                { id: 'r1', type: 'mc', text: "How did many schools initially react to AI tools?", options: ["They integrated them", "They ignored them", "They banned them", "They bought licenses"], answer: "They banned them" },
                { id: 'r2', type: 'text', text: "What does Sarah Chen compare banning AI to?", answer: "Banning calculators in the 80s" },
                { id: 'r3', type: 'text', text: "In the 'integrated' approach, what role does the student play?", answer: "Editor / Fact-checker" },
                { id: 'r4', type: 'mc', text: "The author suggests the real problem lies with...", options: ["The students' laziness", "The AI's power", "The assessment methods", "The teachers' fear"], answer: "The assessment methods" },
                { id: 'r5', type: 'text', text: "Find a phrase in the last paragraph that means 'lack of growth/change'.", answer: "Stagnation" }
            ]
        },
        writing: {
            prompt: "The School Newsletter is launching a 'Tech for Study' column to help fellow DSE students manage their hectic schedules. As a frequent user of productivity tools, you have been invited to write a short review of a new mobile app that has helped you improve your study efficiency. Your review will help classmates decide if the app is a worthwhile addition to their digital toolkit.",
            requirements: "Write about 150 words. Tone: Informative. Include: 1 pro and 1 con.",
            topic: "App Review for School Newsletter"
        },
        listening: {
            script: `(News Report: 'Urban Farming')\n\nReporter: "I'm standing on the roof of a factory in Kwun Tong. But instead of concrete, I'm surrounded by tomatoes and lettuce. This is 'SkyFarm'. Founder Jenny Ho joins me."\n\nJenny: "Hi. We use hydroponics—that means growing plants in water, not soil. It's perfect for Hong Kong because it's light. Soil is heavy; water is lighter. We recycle 90% of the water, and because we're on a roof, we get free sunlight. We sell these vegetables to local restaurants within 5 km. Zero carbon footprint from transport!"`,
            questions: [
                { id: 'l1', text: "Where is the farm located specifically?", answer: "Kwun Tong (factory roof)" },
                { id: 'l2', text: "Why is 'hydroponics' suitable for Hong Kong buildings according to Jenny?", answer: "It is light / Soil is too heavy for most roofs" },
                { id: 'l3', text: "Who buys the vegetables?", answer: "Local restaurants (within 5 km)" }
            ]
        },
        speaking: {
            topics: [
                "Should students be required to learn coding?",
                "The benefits of part-time jobs for students",
                "A recent news story that caught your attention"
            ]
        }
    },

    // === SET C: ENVIRONMENT ===
    'C': {
        reading: {
            passage: `(Environment) 'The Cost of Fast Fashion'\n\nFor most teenagers, buying a new t-shirt for $50 seems like a bargain. But the true cost is paid elsewhere. The 'fast fashion' industry, characterized by rapid production of cheap clothing, is the second largest polluter in the world, just behind the oil industry.\n\nThe problem is twofold: production and disposal. Creating a single pair of jeans requires 7,000 liters of water—enough for a person to drink for seven years. Dyes and chemicals are often dumped into rivers, turning waterways into toxic sludges.\n\nThen comes disposal. Because the clothes are cheap quality, they aren't meant to last. Hong Kong alone sends over 300 tonnes of textiles to landfills every day. "We treat clothes like disposable cups," says eco-activist Mark Liu. "Wear once, post a photo, throw away."\n\nHowever, a "Slow Fashion" movement is emerging. Thrift shopping (buying second-hand) has become trendy among Gen Z. Upcycling workshops, where old clothes are redesigned, are fully booked. It seems style and sustainability can coexist, but only if consumers change their mindset from 'more' to 'better'.`,
            questions: [
                { id: 'r1', type: 'text', text: "Which industry is the largest polluter according to the text?", answer: "Oil industry (Fast fashion is second)" },
                { id: 'r2', type: 'mc', text: "How much water is needed for one pair of jeans?", options: ["700 liters", "7,000 liters", "17,000 liters", "70 liters"], answer: "7,000 liters" },
                { id: 'r3', type: 'text', text: "What is the 'twofold' problem mentioned?", answer: "Production and Disposal" },
                { id: 'r4', type: 'text', text: "According to Mark Liu, how do people treat clothes nowadays?", answer: "Like disposable cups" },
                { id: 'r5', type: 'mc', text: "What is one example of the 'Slow Fashion' movement?", options: ["Buying expensive brands", "Thrift shopping / Buying second-hand", "Washing clothes less", "Donating to charity"], answer: "Thrift shopping / Buying second-hand" }
            ]
        },
        writing: {
            prompt: "Environmental awareness is a growing concern among students at our school. To kickstart the year with a meaningful change, the Green Club wants to challenge the student body to reduce their ecological footprint. As the Secretary of the Green Club, write a short proposal to the Principal suggesting a 'No Plastic Week' on campus, explaining why this initiative is necessary and how it will be implemented.",
            requirements: "Write about 150 words. Tone: Formal/Persuasive. Format: Proposal (Title, Introduction, Details, Conclusion).",
            topic: "Proposal for No Plastic Week"
        },
        listening: {
            script: `(Career Talk)\n\nSpeaker: "Many of you want to be doctors or lawyers. That's safe. But let me tell you about a job that didn't exist ten years ago: 'Drone Pilot'. I fly drones to inspect bridges and skyscrapers. It's safer than sending a human climber, and faster. Yesterday, I used a thermal camera on my drone to find a water leak in a building wall. You need steady hands, yes, but also a certification in aviation law. It's basically playing a video game, but with real-world consequences."`,
            questions: [
                { id: 'l1', text: "What job does the speaker have?", answer: "Drone Pilot" },
                { id: 'l2', text: "Why is using a drone better than a human for inspection?", answer: "Safer and faster / Safer for bridges and skyscrapers" },
                { id: 'l3', text: "What certification does the speaker say you need?", answer: "Certification in aviation law" }
            ]
        },
        speaking: {
            topics: [
                "Ways to reduce plastic waste at school",
                "Your dream holiday destination",
                "Do celebrities have a responsibility to be good role models?"
            ]
        }
    },

    // === SET D: CULTURE ===
    'D': {
        reading: {
            passage: `(Culture) 'The Neon Twilight'\n\nFor decades, the vibrant glow of neon signs defined Hong Kong's streets. They were chaotic, colourful, and iconic. But today, the lights are going out. Due to stricter safety regulations and the rise of cheaper, more energy-efficient LED screens, thousands of neon signs have been removed.\n\nWhile correct from a safety standpoint, cultural advocates mourn the loss of the city's visual identity. "LEDs are flat and cold," explains master craftsman Mr. Wu, who has bent glass tubes for forty years. "Neon has warmth. It hums. It feels alive."\n\nThere is a race against time to preserve the remaining signs. Museums like M+ are acquiring some for their collections, but a sign in a museum is like a tiger in a cage—safe, but stripped of its context. The street was its natural habitat.\n\nHowever, a new generation of artists is learning the trade. They aren't making signs for restaurants, but creating neon art pieces for galleries and homes. While the skyline changes, the craft itself might survive by evolving from commercial signage to fine art.`,
            questions: [
                { id: 'r1', type: 'text', text: "Give two reasons why neon signs are being removed.", answer: "Safety regulations and cheaper/efficient LEDs" },
                { id: 'r2', type: 'mc', text: "How does Mr. Wu describe the difference between LED and Neon?", options: ["LED is brighter", "Neon has warmth/feels alive", "Neon is cheaper", "LED is dangerous"], answer: "Neon has warmth/feels alive" },
                { id: 'r3', type: 'text', text: "What does the author compare a 'sign in a museum' to?", answer: "A tiger in a cage" },
                { id: 'r4', type: 'text', text: "How is the new generation of artists using neon differently?", answer: "Creating art pieces (for galleries/homes) instead of commercial signage" },
                { id: 'r5', type: 'mc', text: "Which word best describes the author's tone regarding the removal?", options: ["Indifferent", "Celebratory", "Nostalgic/Melancholy", "Angry"], answer: "Nostalgic/Melancholy" }
            ]
        },
        writing: {
            prompt: "You recently purchased a high-end electronic gadget from a local store, but to your disappointment, it malfunctioned after just one day of use. When you tried to contact the shop, you found their customer service unhelpful. Write a regular letter of complaint to the store manager, explaining the situation and what action you expect them to take to resolve the issue.",
            requirements: "Write about 150 words. Tone: Formal but firm. Format: Formal Letter (Dear Manager, ... Yours faithfully).",
            topic: "Complaint Letter to Store Manager"
        },
        listening: {
            script: `(School Radio)\n\nHost: "And finally, a reminder about the 'Talent Quest'. Sign-ups close this Friday. We are looking for everything—singing, magic, comedy, whatever! Remember, group acts are limited to 5 people this year due to stage size. Also, if you need special equipment like amplifiers, you must list it on the form. Don't show up on the day asking for a drum kit! The winner gets a $500 book voucher and performs at the graduation dinner."`,
            questions: [
                { id: 'l1', text: "When do sign-ups close?", answer: "This Friday" },
                { id: 'l2', text: "What is the limit for group acts?", answer: "5 people" },
                { id: 'l3', text: "What happens if you don't list your equipment on the form?", answer: "You won't have it / Can't ask for a drum kit on the day" }
            ]
        },
        speaking: {
            topics: [
                "A traditional festival you enjoy",
                "Is it important to learn a second language?",
                "The most important quality in a friend"
            ]
        }
    },

    // === SET E: HEALTH ===
    'E': {
        reading: {
            passage: `(Health) 'The Sleep Debt'\n\nIf sleep was a bank account, most Hong Kong students would be bankrupt. A typical secondary student gets less than 6 hours of sleep, far below the recommended 8 to 10 hours. We view sleep as time "wasted"—time that could be spent studying, gaming, or scrolling.\n\nBut biology disagrees. Sleep is when the brain "cleans" itself, complying memories and removing toxins built up during the day. "Studying all night is counter-productive," warns neurologist Dr. Tan. "You might read the textbook, but your brain's 'save button' is broken if you don't sleep."\n\nThe consequences are visible: irritability, anxiety, and a drop in immune function. Schools are noticing "zombie students" who are physically present but mentally checked out.\n\nSome argue for a later school start time, citing studies that teenagers' biological clocks are naturally shifted later. However, without a change in the relentless workload and cultural pressure to perform, an extra hour in the morning might just mean students stay up an hour later at night.`,
            questions: [
                { id: 'r1', type: 'text', text: "What metaphor does the author use for sleep in the first sentence?", answer: "A bank account" },
                { id: 'r2', type: 'mc', text: "According to Dr. Tan, what happens if you don't sleep?", options: ["You get hungry", "Your brain's 'save button' is broken", "You learn faster", "Nothing"], answer: "Your brain's 'save button' is broken" },
                { id: 'r3', type: 'text', text: "List two consequences of lack of sleep mentioned.", answer: "Irritability, anxiety, drop in immune function (Any 2)" },
                { id: 'r4', type: 'mc', text: "Why do some people argue for a later school start time?", answer: "Teenagers' biological clocks are shifted later" },
                { id: 'r5', type: 'text', text: "Why might a later start time NOT work according to the author?", answer: "Workload/Cultural pressure; students might just stay up later" }
            ]
        },
        writing: {
            prompt: "The debate over student workload has once again become a hot topic in the local news, with many questioning the value of traditional home assignments. Some argue that it is a burden on mental health, while others believe it is essential for academic success. Write a letter to the editor of the Hong Kong Daily expressing your opinion on whether homework should be abolished for secondary school students.",
            requirements: "Write about 150 words. Tone: Argumentative/Persuasive. Format: Letter to the Editor (Dear Editor).",
            topic: "Letter to the Editor: Homework"
        },
        listening: {
            script: `(Shopping Mall Announcement)\n\n"Attention shoppers. We have found a lost child near the Food Court on Level 3. He is a boy, about 5 years old, wearing a red Spiderman t-shirt and blue shorts. He says his name is 'Timmy'. If you are looking for him, please come to the Customer Service Desk on the Ground Floor, next to the cinema. For security reasons, please bring photo ID to verify your identity. Thank you."`,
            questions: [
                { id: 'l1', text: "Where was the child found?", answer: "Food Court (Level 3)" },
                { id: 'l2', text: "Describe the child's clothing.", answer: "Red Spiderman t-shirt and blue shorts" },
                { id: 'l3', text: "Where should the parents go to pick him up?", answer: "Customer Service Desk (Ground Floor, next to cinema)" }
            ]
        },
        speaking: {
            topics: [
                "Sports Day: Participate or Watch?",
                "Should junk food be banned in schools?",
                "How do you handle stress?"
            ]
        }
    }
};

module.exports = PAPERS;
