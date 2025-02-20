export const quizData = {
  categories: [
    {
      name: "Software Developer/Engineer",
      questions: [
        {
          question: "What is OOP?",
          options: [
            "Object-Oriented Programming",
            "Operating Object Procedure",
            "Optimal Operating Process",
            "Open Object Protocol",
          ],
          answer: "Object-Oriented Programming",
          difficulty: "Easy",
          explanation:
            "OOP stands for Object-Oriented Programming, a paradigm centered around objects rather than actions.",
        },
        {
          question: "What is the time complexity of a binary search algorithm?",
          options: ["O(n)", "O(log n)", "O(n^2)", "O(1)"],
          answer: "O(log n)",
          difficulty: "Medium",
          explanation:
            "Binary search divides the search interval in half each time, leading to logarithmic time complexity.",
        },
        {
          question:
            "Which programming language is known as the language of the web?",
          options: ["Python", "JavaScript", "C++", "Java"],
          answer: "JavaScript",
          difficulty: "Easy",
          explanation:
            "JavaScript is widely used for client-side scripting in web browsers.",
        },
        {
          question: "What is encapsulation in OOP?",
          options: [
            "Hiding internal state and requiring all interaction through methods",
            "Reusing code through inheritance",
            "Defining multiple methods with the same name",
            "Objects responding differently to the same method call",
          ],
          answer:
            "Hiding internal state and requiring all interaction through methods",
          difficulty: "Medium",
          explanation:
            "Encapsulation restricts direct access to object data, promoting modularity and maintainability.",
        },
      ],
    },
    {
      name: "Web Developer (Front-end, Back-end, Full-stack)",
      questions: [
        {
          question: "What does HTML stand for?",
          options: [
            "Hypertext Markup Language",
            "Hyperlink Text Markup Language",
            "Hyperloop Markup Language",
            "HyperText Media Language",
          ],
          answer: "Hypertext Markup Language",
          difficulty: "Easy",
          explanation:
            "HTML is the standard markup language for creating web pages.",
        },
        {
          question: "Which of the following is a JavaScript framework?",
          options: ["Laravel", "Django", "React", "Ruby on Rails"],
          answer: "React",
          difficulty: "Easy",
          explanation:
            "React is a popular JavaScript library for building user interfaces.",
        },
        {
          question: "In CSS, what does the acronym CSS stand for?",
          options: [
            "Colorful Style Sheets",
            "Creative Style System",
            "Cascading Style Sheets",
            "Computer Style Sheets",
          ],
          answer: "Cascading Style Sheets",
          difficulty: "Easy",
          explanation:
            "CSS describes how HTML elements are to be displayed on screen.",
        },
        {
          question: 'What does the "Box Model" in CSS represent?',
          options: [
            "A method for creating boxes on the webpage",
            "A design pattern for object-oriented programming",
            "A box that wraps around every HTML element, consisting of margins, borders, padding, and content",
            "A framework for building responsive web design",
          ],
          answer:
            "A box that wraps around every HTML element, consisting of margins, borders, padding, and content",
          difficulty: "Medium",
          explanation:
            "The CSS box model is essential for designing and layout of web pages.",
        },
      ],
    },
    {
      name: "Mobile App Developer",
      questions: [
        {
          question:
            "Which database is commonly used for local storage in mobile applications?",
          options: ["SQLite", "MongoDB", "Cassandra", "Firebase"],
          answer: "SQLite",
          difficulty: "Easy",
          explanation:
            "SQLite is a lightweight, file-based database commonly used in mobile apps.",
        },
        {
          question:
            "Which programming language is used for developing iOS applications?",
          options: ["Kotlin", "Swift", "Java", "C#"],
          answer: "Swift",
          difficulty: "Easy",
          explanation:
            "Swift is Apple’s programming language for iOS and macOS development.",
        },
        {
          question: 'What does "Responsive Design" mean in mobile development?',
          options: [
            "Design that responds to user input",
            "Design that adapts to different screen sizes and orientations",
            "Design that loads quickly",
            "Design that uses responsive AI",
          ],
          answer:
            "Design that adapts to different screen sizes and orientations",
          difficulty: "Medium",
          explanation:
            "Responsive design ensures that the user interface adjusts smoothly across various devices.",
        },
        {
          question:
            "Which tool is commonly used for cross-platform mobile app development?",
          options: ["React Native", "Xcode", "Android Studio", "Visual Studio"],
          answer: "React Native",
          difficulty: "Medium",
          explanation:
            "React Native allows developers to use React along with native platform capabilities.",
        },
      ],
    },
    {
      name: "Data Scientist",
      questions: [
        {
          question:
            "Which library is widely used for numerical computation in Python?",
          options: ["NumPy", "Pandas", "Matplotlib", "Seaborn"],
          answer: "NumPy",
          difficulty: "Easy",
          explanation:
            "NumPy provides support for large, multi-dimensional arrays and matrices.",
        },
        {
          question:
            "What is the difference between supervised and unsupervised learning?",
          options: [
            "Supervised uses labeled data; unsupervised uses unlabeled data",
            "Supervised is faster than unsupervised",
            "Unsupervised uses labeled data; supervised uses unlabeled data",
            "There is no difference",
          ],
          answer:
            "Supervised uses labeled data; unsupervised uses unlabeled data",
          difficulty: "Easy",
          explanation:
            "Supervised learning trains models on known input and output data.",
        },
        {
          question: 'What does "overfitting" refer to in machine learning?',
          options: [
            "Model performs well on training data but poorly on new data",
            "Model performs poorly on training data but well on new data",
            "Model fits the data perfectly",
            "Model is undertrained",
          ],
          answer: "Model performs well on training data but poorly on new data",
          difficulty: "Medium",
          explanation:
            "Overfitting occurs when a model learns noise instead of the signal.",
        },
        {
          question:
            "Which algorithm is commonly used for classification tasks?",
          options: [
            "K-Means Clustering",
            "Linear Regression",
            "K-Nearest Neighbors",
            "Apriori Algorithm",
          ],
          answer: "K-Nearest Neighbors",
          difficulty: "Medium",
          explanation:
            "KNN is a simple, instance-based learning algorithm used for classification.",
        },
      ],
    },
    {
      name: "Machine Learning Engineer",
      questions: [
        {
          question:
            "What is the activation function typically used in the output layer for binary classification tasks?",
          options: ["Sigmoid", "ReLU", "Tanh", "Softmax"],
          answer: "Sigmoid",
          difficulty: "Easy",
          explanation:
            "Sigmoid squashes output between 0 and 1, suitable for binary classification.",
        },
        {
          question:
            "What is a convolutional neural network (CNN) mainly used for?",
          options: [
            "Text analysis",
            "Image and video recognition",
            "Time series forecasting",
            "Recommender systems",
          ],
          answer: "Image and video recognition",
          difficulty: "Medium",
          explanation:
            "CNNs are designed to process data with grid-like topology, like images.",
        },
        {
          question: 'What does "backpropagation" refer to in neural networks?',
          options: [
            "The process of moving data backward through the network",
            "The algorithm used to calculate the gradient of the loss function",
            "A method for initializing network weights",
            "A type of activation function",
          ],
          answer:
            "The algorithm used to calculate the gradient of the loss function",
          difficulty: "Medium",
          explanation:
            "Backpropagation computes gradients for weight updates in training.",
        },
        {
          question:
            "Which of the following is a method to prevent overfitting in machine learning models?",
          options: [
            "Using a smaller dataset",
            "Regularization techniques",
            "Increasing the number of features",
            "Reducing the training time",
          ],
          answer: "Regularization techniques",
          difficulty: "Medium",
          explanation:
            "Regularization adds a penalty to the loss function to discourage complexity.",
        },
      ],
    },
    {
      name: "DevOps Engineer",
      questions: [
        {
          question:
            "Which tool is commonly used for automating infrastructure provisioning?",
          options: ["Terraform", "Jenkins", "Docker", "Ansible"],
          answer: "Terraform",
          difficulty: "Easy",
          explanation:
            "Terraform enables infrastructure as code for provisioning resources.",
        },
        {
          question: "Which of the following is a Continuous Integration tool?",
          options: ["Git", "Docker", "Jenkins", "Ansible"],
          answer: "Jenkins",
          difficulty: "Easy",
          explanation:
            "Jenkins automates the building and testing of software projects.",
        },
        {
          question: "What is the primary purpose of Docker in DevOps?",
          options: [
            "Automating testing",
            "Configuration management",
            "Containerization of applications",
            "Monitoring applications",
          ],
          answer: "Containerization of applications",
          difficulty: "Medium",
          explanation:
            "Docker packages applications into containers for consistent deployment.",
        },
        {
          question: 'What does "Infrastructure as Code" (IaC) refer to?',
          options: [
            "Coding standards for developers",
            "Managing infrastructure through code",
            "Automating software builds",
            "Managing database schemas",
          ],
          answer: "Managing infrastructure through code",
          difficulty: "Medium",
          explanation:
            "IaC allows infrastructure setup using code, improving automation and consistency.",
        },
      ],
    },
    {
      name: "Cloud Engineer",
      questions: [
        {
          question:
            "Which service is used to manage and provision AWS resources using templates?",
          options: [
            "AWS CloudFormation",
            "AWS IAM",
            "AWS CloudTrail",
            "AWS EC2",
          ],
          answer: "AWS CloudFormation",
          difficulty: "Easy",
          explanation:
            "CloudFormation allows you to model and provision AWS resources using code.",
        },
        {
          question: "What does SaaS stand for in cloud computing?",
          options: [
            "Software as a Service",
            "Storage as a Service",
            "System as a Service",
            "Security as a Service",
          ],
          answer: "Software as a Service",
          difficulty: "Easy",
          explanation:
            "SaaS delivers software applications over the internet on a subscription basis.",
        },
        {
          question:
            "Which of the following is a cloud computing platform provided by Microsoft?",
          options: ["AWS", "Google Cloud Platform", "Azure", "DigitalOcean"],
          answer: "Azure",
          difficulty: "Easy",
          explanation:
            "Microsoft Azure offers a range of cloud services for computing, analytics, and more.",
        },
        {
          question:
            "What is the primary benefit of using cloud computing services?",
          options: [
            "Lower latency",
            "High initial investment",
            "Scalability and flexibility",
            "Complex management",
          ],
          answer: "Scalability and flexibility",
          difficulty: "Easy",
          explanation:
            "Cloud services allow businesses to scale resources up or down as needed.",
        },
      ],
    },
    {
      name: "Game Developer",
      questions: [
        {
          question:
            "In game development, what is the purpose of a physics engine?",
          options: [
            "To simulate realistic movement and interaction of objects",
            "To render 3D models",
            "To handle sound effects",
            "To manage game state",
          ],
          answer: "To simulate realistic movement and interaction of objects",
          difficulty: "Easy",
          explanation:
            "Physics engines model the laws of physics to create realistic motion and collisions.",
        },
        {
          question:
            "Which programming language is commonly used for developing games in the Unity engine?",
          options: ["C#", "Java", "Python", "C++"],
          answer: "C#",
          difficulty: "Easy",
          explanation: "Unity primarily uses C# for scripting game behavior.",
        },
        {
          question: 'What is "rendering" in the context of game development?',
          options: [
            "Processing user input",
            "Generating the visual output from a model",
            "Designing game mechanics",
            "Testing the game for bugs",
          ],
          answer: "Generating the visual output from a model",
          difficulty: "Medium",
          explanation:
            "Rendering converts 3D models and environments into 2D images on the screen.",
        },
        {
          question:
            "Which of the following is a popular game development engine?",
          options: [
            "Unreal Engine",
            "Eclipse",
            "IntelliJ IDEA",
            "Visual Studio Code",
          ],
          answer: "Unreal Engine",
          difficulty: "Easy",
          explanation:
            "Unreal Engine is a widely used engine known for high-quality graphics.",
        },
      ],
    },
    {
      name: "Embedded Systems Engineer",
      questions: [
        {
          question:
            "Which communication protocol is often used for short-distance communication between embedded devices?",
          options: ["I2C", "HTTP", "FTP", "SMTP"],
          answer: "I2C",
          difficulty: "Medium",
          explanation:
            "I2C is a multi-master, multi-slave, packet-switched, single-ended, serial communication bus.",
        },
        {
          question: 'What does "RTOS" stand for in embedded systems?',
          options: [
            "Real-Time Operating System",
            "Runtime Operational Sequence",
            "Random Time Operation System",
            "Reconfigurable Task Operating System",
          ],
          answer: "Real-Time Operating System",
          difficulty: "Medium",
          explanation:
            "An RTOS is designed to serve real-time application requests.",
        },
        {
          question:
            "Which of the following is a commonly used microcontroller in embedded systems?",
          options: [
            "Arduino Uno",
            "Raspberry Pi",
            "Intel Core i7",
            "AMD Ryzen",
          ],
          answer: "Arduino Uno",
          difficulty: "Easy",
          explanation:
            "Arduino Uno is an open-source microcontroller board based on the Microchip ATmega328P.",
        },
        {
          question:
            "What is the purpose of a watchdog timer in embedded systems?",
          options: [
            "To keep track of time",
            "To reset the system in case of malfunction",
            "To manage power consumption",
            "To monitor user inputs",
          ],
          answer: "To reset the system in case of malfunction",
          difficulty: "Medium",
          explanation:
            "A watchdog timer resets the system if the main program fails to operate properly.",
        },
      ],
    },
    {
      name: "Database Administrator",
      questions: [
        {
          question:
            "Which SQL statement is used to modify existing records in a database?",
          options: ["UPDATE", "SELECT", "INSERT", "DELETE"],
          answer: "UPDATE",
          difficulty: "Easy",
          explanation: "UPDATE is used to modify existing records in a table.",
        },
        {
          question: "What is a primary key in a database table?",
          options: [
            "A unique identifier for each record in a table",
            "A field that can be left empty",
            "A key used to encrypt the database",
            "A foreign key in another table",
          ],
          answer: "A unique identifier for each record in a table",
          difficulty: "Easy",
          explanation:
            "Primary keys uniquely identify each record and cannot be NULL.",
        },
        {
          question:
            "Which command is used to remove all records from a table, including all spaces allocated for the records?",
          options: ["DELETE", "TRUNCATE", "DROP", "REMOVE"],
          answer: "TRUNCATE",
          difficulty: "Medium",
          explanation:
            "TRUNCATE removes all rows quickly by deallocating the data pages.",
        },
        {
          question: "What does ACID stand for in database systems?",
          options: [
            "Atomicity, Consistency, Isolation, Durability",
            "Accuracy, Concurrency, Isolation, Durability",
            "Atomicity, Consistency, Integrity, Dependability",
            "Availability, Consistency, Integrity, Durability",
          ],
          answer: "Atomicity, Consistency, Isolation, Durability",
          difficulty: "Medium",
          explanation:
            "ACID properties ensure reliable processing of database transactions.",
        },
      ],
    },
    {
      name: "Quality Assurance (QA) Engineer",
      questions: [
        {
          question: "Which of the following is a non-functional testing type?",
          options: [
            "Performance testing",
            "Unit testing",
            "Integration testing",
            "Smoke testing",
          ],
          answer: "Performance testing",
          difficulty: "Easy",
          explanation:
            "Performance testing evaluates the speed, responsiveness, and stability under workload.",
        },
        {
          question: "What is the main goal of regression testing?",
          options: [
            "To test new functionality",
            "To check for performance issues",
            "To ensure recent changes haven’t broken existing features",
            "To test the security of the application",
          ],
          answer: "To ensure recent changes haven’t broken existing features",
          difficulty: "Medium",
          explanation:
            "Regression testing verifies that code changes do not adversely affect existing functionality.",
        },
        {
          question: "Which tool is commonly used for automated UI testing?",
          options: ["Selenium", "Jenkins", "Git", "Docker"],
          answer: "Selenium",
          difficulty: "Easy",
          explanation:
            "Selenium automates browsers for testing web applications.",
        },
        {
          question: 'What does "black box testing" refer to?',
          options: [
            "Testing without looking at internal code structure",
            "Testing by developers",
            "Testing with access to the source code",
            "Testing of security vulnerabilities",
          ],
          answer: "Testing without looking at internal code structure",
          difficulty: "Medium",
          explanation:
            "Black box testing focuses on input and output without knowledge of internal code.",
        },
      ],
    },
    {
      name: "Systems Analyst",
      questions: [
        {
          question:
            "Which tool is commonly used by systems analysts to visually represent workflows and processes?",
          options: [
            "Flowcharts",
            "ER Diagrams",
            "Gantt Charts",
            "Venn Diagrams",
          ],
          answer: "Flowcharts",
          difficulty: "Easy",
          explanation:
            "Flowcharts use symbols to depict the flow of processes.",
        },
        {
          question: "What is a use case in systems analysis?",
          options: [
            "A description of how users interact with the system",
            "A diagram of data flow",
            "A method for defining database structure",
            "A sequence of events in project development",
          ],
          answer: "A description of how users interact with the system",
          difficulty: "Medium",
          explanation:
            "Use cases describe system functionality from a user’s perspective.",
        },
        {
          question: "What does SWOT stand for in analysis?",
          options: [
            "Strengths, Weaknesses, Opportunities, Threats",
            "Systems, Workflow, Objectives, Timelines",
            "Software, Web, Operations, Technology",
            "Strategies, Workflows, Output, Techniques",
          ],
          answer: "Strengths, Weaknesses, Opportunities, Threats",
          difficulty: "Medium",
          explanation:
            "SWOT analysis assesses internal and external factors impacting a project.",
        },
        {
          question:
            "What is the main purpose of a feasibility study in systems analysis?",
          options: [
            "To assess the practicality and viability of a proposed project",
            "To design the user interface",
            "To write code for the system",
            "To perform testing on the system",
          ],
          answer:
            "To assess the practicality and viability of a proposed project",
          difficulty: "Medium",
          explanation:
            "Feasibility studies evaluate the potential success before committing resources.",
        },
      ],
    },
    {
      name: "Cybersecurity Analyst",
      questions: [
        {
          question:
            "Which type of attack involves overwhelming a system with traffic to make it unavailable to users?",
          options: [
            "Distributed Denial of Service (DDoS)",
            "Phishing",
            "SQL Injection",
            "Man-in-the-Middle Attack",
          ],
          answer: "Distributed Denial of Service (DDoS)",
          difficulty: "Easy",
          explanation:
            "DDoS attacks flood a target with traffic from multiple sources.",
        },
        {
          question:
            "What does multi-factor authentication (MFA) add to the security process?",
          options: [
            "An additional layer of security by requiring multiple methods of verification",
            "Automatic detection of malicious software",
            "Encryption of passwords during transmission",
            "A backup of the authentication process",
          ],
          answer:
            "An additional layer of security by requiring multiple methods of verification",
          difficulty: "Easy",
          explanation:
            "MFA requires users to provide two or more verification factors.",
        },
        {
          question: "What is phishing?",
          options: [
            "A method of sending fraudulent messages to trick individuals into revealing sensitive information",
            "A type of malware that replicates itself",
            "A security protocol for secure communication",
            "A technique used to prevent unauthorized access",
          ],
          answer:
            "A method of sending fraudulent messages to trick individuals into revealing sensitive information",
          difficulty: "Easy",
          explanation:
            "Phishing often involves emails pretending to be from reputable sources.",
        },
        {
          question:
            "Which of the following is a common method for detecting intrusions on a network?",
          options: [
            "Firewall",
            "Antivirus software",
            "Intrusion Detection System (IDS)",
            "Encryption",
          ],
          answer: "Intrusion Detection System (IDS)",
          difficulty: "Medium",
          explanation:
            "An IDS monitors network traffic for suspicious activity and known threats.",
        },
      ],
    },
    {
      name: "Blockchain Developer",
      questions: [
        {
          question: "What is a smart contract in blockchain?",
          options: [
            "A self-executing contract with the terms directly written into code",
            "A method of encrypting blockchain transactions",
            "A type of token used in cryptocurrencies",
            "Software that protects the blockchain from attacks",
          ],
          answer:
            "A self-executing contract with the terms directly written into code",
          difficulty: "Easy",
          explanation:
            "Smart contracts automate the execution of agreements on the blockchain.",
        },
        {
          question: "What is the primary purpose of blockchain technology?",
          options: [
            "To create a centralized database",
            "To provide a secure and transparent way to record transactions in a decentralized ledger",
            "To encrypt communications between two parties",
            "To manage cloud resources",
          ],
          answer:
            "To provide a secure and transparent way to record transactions in a decentralized ledger",
          difficulty: "Easy",
          explanation:
            "Blockchain maintains a distributed ledger of transactions without central authority.",
        },
        {
          question:
            'What does "proof of work" refer to in blockchain consensus mechanisms?',
          options: [
            "Miners solving complex mathematical problems to validate transactions",
            "A security protocol for authentication",
            "An agreement between users and miners",
            "A way to back up data",
          ],
          answer:
            "Miners solving complex mathematical problems to validate transactions",
          difficulty: "Medium",
          explanation:
            "Proof of work requires computational effort to prevent abuse of the network.",
        },
        {
          question:
            "Which programming language is commonly used to write smart contracts on Ethereum?",
          options: ["Python", "C++", "Solidity", "Java"],
          answer: "Solidity",
          difficulty: "Medium",
          explanation:
            "Solidity is a contract-oriented language designed for Ethereum.",
        },
      ],
    },
    {
      name: "Artificial Intelligence Engineer",
      questions: [
        {
          question: "What is reinforcement learning in AI?",
          options: [
            "An agent learns by interacting with its environment",
            "A method to label training data",
            "A technique to reduce overfitting",
            "A tool to preprocess data",
          ],
          answer: "An agent learns by interacting with its environment",
          difficulty: "Easy",
          explanation:
            "Reinforcement learning uses rewards and penalties to drive learning.",
        },

        {
          question: "What is overfitting in machine learning models?",
          options: [
            "When the model performs well on training data but poorly on new data",
            "When the model performs well on new data but poorly on training data",
            "When the model is too simple",
            "When the model has too few parameters",
          ],
          answer:
            "When the model performs well on training data but poorly on new data",
          difficulty: "Medium",
          explanation:
            "Overfitting indicates poor generalization to unseen data.",
        },
        {
          question: "What is Natural Language Processing (NLP)?",
          options: [
            "A field of AI that gives computers the ability to understand text and spoken words like humans",
            "A programming language used for AI development",
            "A protocol for network communication",
            "A database management system",
          ],
          answer:
            "A field of AI that gives computers the ability to understand text and spoken words like humans",
          difficulty: "Easy",
          explanation:
            "NLP enables machines to interpret and generate human language.",
        },
      ],
    },
  ],
};
