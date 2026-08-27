function isoDate(offsetDays) {
  const d = new Date();
  d.setHours(12, 0, 0, 0);
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0, 10);
}

function evaluation({ score, maxMarks, feedback, rubric, missingPoints, suggestions, method }) {
  return {
    score,
    feedback,
    evaluation: {
      method,
      rubric,
      missingPoints,
      suggestions,
    },
  };
}

function buildSeed() {
  const gradedFizz = evaluation({
    score: 10,
    maxMarks: 12,
    method: "heuristic",
    feedback:
      "Strong coverage of the FizzBuzz rules with a clear loop and condition order. Mention the modulo operator more explicitly and handle the n = 0 edge case.",
    rubric: {
      contentCoverage: {
        score: 4,
        max: 5,
        comment: "Covers multiples of 3, 5, and both, plus a loop from 1 to n.",
      },
      semanticSimilarity: {
        score: 4,
        max: 4,
        comment: "Answer tracks the model solution: iterate, test 15 first, then 3 and 5.",
      },
      grammarClarity: {
        score: 2,
        max: 3,
        comment: "Readable prose with a few run-on sentences.",
      },
    },
    missingPoints: ["Edge case when n is less than 1", "Explicit mention of the modulo operator"],
    suggestions: ["Show a short sample output for n = 15", "Call out why 15 must be checked before 3 or 5"],
  });

  const gradedDigestive = evaluation({
    score: 13,
    maxMarks: 15,
    method: "heuristic",
    feedback:
      "Clear path from mouth to large intestine with enzyme roles. Expand on bile (not an enzyme) and absorption in the small intestine.",
    rubric: {
      contentCoverage: {
        score: 5,
        max: 6,
        comment: "Mouth, esophagus, stomach, small intestine, and large intestine are present.",
      },
      semanticSimilarity: {
        score: 5,
        max: 5,
        comment: "Matches the model answer’s organ sequence and enzyme examples.",
      },
      grammarClarity: {
        score: 3,
        max: 4,
        comment: "Mostly accurate academic tone; a couple of comma splices.",
      },
    },
    missingPoints: ["Bile emulsifies fats but is not an enzyme", "Villi / microvilli for absorption"],
    suggestions: ["Name amylase, pepsin, and lipase with the organ that secretes each"],
  });

  const gradedWw1 = evaluation({
    score: 9,
    maxMarks: 12,
    method: "heuristic",
    feedback:
      "The MAIN causes are named, but imperialism and the alliance system need a concrete example each (Scramble for Africa, Triple Entente).",
    rubric: {
      contentCoverage: {
        score: 3,
        max: 5,
        comment: "Militarism and nationalism are explained; alliances and imperialism are thin.",
      },
      semanticSimilarity: {
        score: 4,
        max: 4,
        comment: "Overall argument aligns with the model answer’s four-factor frame.",
      },
      grammarClarity: {
        score: 2,
        max: 3,
        comment: "Understandable, with some repetition.",
      },
    },
    missingPoints: ["Assassination of Archduke Franz Ferdinand as the trigger", "Named alliance blocs"],
    suggestions: ["Give one example per MAIN factor", "Separate long-term causes from the 1914 trigger"],
  });

  return [
    {
      title: "Python Loops & Conditionals",
      subject: "programming",
      text: "Write a Python program that reads an integer n and prints all numbers from 1 to n, replacing multiples of 3 with 'Fizz', multiples of 5 with 'Buzz', and multiples of both with 'FizzBuzz'.",
      modelAnswer:
        "Read n. Loop i from 1 to n. If i is divisible by both 3 and 5 print FizzBuzz; else if divisible by 3 print Fizz; else if divisible by 5 print Buzz; else print i. Use the modulo operator and check 15 first so multiples of both are not classified as only Fizz or Buzz. Handle n < 1 by printing nothing or a validation message.",
      maxMarks: 12,
      dueDate: isoDate(-2),
      status: "graded",
      submittedAnswer:
        "I would use a for loop from 1 to n. For each number, if it is divisible by 3 and 5 I print FizzBuzz, if only 3 then Fizz, if only 5 then Buzz, otherwise the number itself. Checking both first avoids printing Fizz when the number is also a multiple of 5.",
      submittedAt: isoDate(-3),
      studentName: "Alex Kumar",
      createdAt: isoDate(-10),
      ...gradedFizz,
    },
    {
      title: "Time & Space Complexity",
      subject: "programming",
      text: "Explain the difference between time complexity and space complexity with one example each. Then analyze the time complexity of binary search.",
      modelAnswer:
        "Time complexity describes how running time grows with input size; space complexity describes extra memory. Bubble sort is O(n^2) time. An array copy uses O(n) extra space. Binary search halves the search space each step, so time is O(log n) and extra space is O(1) iterative or O(log n) recursive.",
      maxMarks: 10,
      dueDate: isoDate(5),
      status: "pending",
      submittedAnswer: null,
      submittedAt: null,
      studentName: null,
      score: null,
      feedback: null,
      evaluation: null,
      createdAt: isoDate(-8),
    },
    {
      title: "Functions and Recursion in Python",
      subject: "programming",
      text: "Implement a recursive function to compute the nth Fibonacci number. Also provide an iterative version and compare their time complexities.",
      modelAnswer:
        "Recursive fib(n): if n <= 1 return n else return fib(n-1)+fib(n-2). Naive recursion is O(2^n) time. Iterative version stores two previous values and runs in O(n) time and O(1) space. Memoized recursion is O(n) time.",
      maxMarks: 15,
      dueDate: isoDate(11),
      status: "pending",
      submittedAnswer: null,
      submittedAt: null,
      studentName: null,
      score: null,
      feedback: null,
      evaluation: null,
      createdAt: isoDate(-7),
    },
    {
      title: "Quadratic Equations",
      subject: "mathematics",
      text: "Solve 2x^2 − 7x + 3 = 0. Show factorization or quadratic formula steps and verify your roots.",
      modelAnswer:
        "Factor: 2x^2 − 7x + 3 = (2x − 1)(x − 3) = 0, so x = 1/2 or x = 3. Quadratic formula: x = [7 ± sqrt(49 − 24)] / 4 = [7 ± 5]/4, giving 3 and 1/2. Verify by substitution: 2*(1/2)^2 − 7*(1/2) + 3 = 0 and 2*9 − 21 + 3 = 0.",
      maxMarks: 10,
      dueDate: isoDate(-1),
      status: "submitted",
      submittedAnswer:
        "Using the quadratic formula, a=2, b=-7, c=3. Discriminant = 49-24=25. Roots are (7+5)/4=3 and (7-5)/4=0.5. I plugged x=3 back in: 18-21+3=0 so it works.",
      submittedAt: isoDate(-1),
      studentName: "Alex Kumar",
      score: null,
      feedback: null,
      evaluation: null,
      createdAt: isoDate(-9),
    },
    {
      title: "Sequences and Series",
      subject: "mathematics",
      text: "An arithmetic progression has first term a1 = 5 and common difference d = 3. Find the 20th term and the sum of the first 20 terms.",
      modelAnswer:
        "a_n = a1 + (n-1)d so a_20 = 5 + 19*3 = 62. Sum S_n = n/2 * (2a1 + (n-1)d) = 20/2 * (10 + 57) = 10*67 = 670. Equivalently S_n = n/2 * (a1 + a_n) = 10*(5+62)=670.",
      maxMarks: 8,
      dueDate: isoDate(8),
      status: "pending",
      submittedAnswer: null,
      submittedAt: null,
      studentName: null,
      score: null,
      feedback: null,
      evaluation: null,
      createdAt: isoDate(-6),
    },
    {
      title: "Human Digestive System",
      subject: "science",
      text: "Describe the path of food through the human digestive system and explain the role of enzymes in digestion.",
      modelAnswer:
        "Food travels mouth → esophagus → stomach → small intestine → large intestine. Salivary amylase starts starch digestion. Pepsin in the stomach digests proteins. Pancreatic lipase, amylase, and proteases act in the small intestine. Bile from the liver emulsifies fats but is not an enzyme. Villi in the small intestine absorb nutrients.",
      maxMarks: 15,
      dueDate: isoDate(-4),
      status: "graded",
      submittedAnswer:
        "Food starts in the mouth where chewing and saliva begin digestion, then the esophagus carries it to the stomach. The stomach uses acid and pepsin to break down protein. In the small intestine enzymes from the pancreas digest carbs, proteins, and fats. The large intestine absorbs water. Enzymes speed up chemical breakdown of food into smaller molecules the body can absorb.",
      submittedAt: isoDate(-5),
      studentName: "Alex Kumar",
      createdAt: isoDate(-12),
      ...gradedDigestive,
    },
    {
      title: "Electric Circuits Basics",
      subject: "science",
      text: "Define voltage, current, and resistance. Using Ohm’s law, calculate the current through a 220Ω resistor connected to an 11V source.",
      modelAnswer:
        "Voltage is potential difference (energy per charge). Current is flow of charge. Resistance opposes current. Ohm’s law: V = IR so I = V/R = 11/220 = 0.05 A (50 mA).",
      maxMarks: 10,
      dueDate: isoDate(2),
      status: "submitted",
      submittedAnswer:
        "Voltage is the push that moves charge, current is how much charge flows per second, and resistance is how much the material opposes that flow. Ohm’s law is V=IR so I = 11 / 220 = 0.05 amperes.",
      submittedAt: isoDate(0),
      studentName: "Alex Kumar",
      score: null,
      feedback: null,
      evaluation: null,
      createdAt: isoDate(-5),
    },
    {
      title: "World War I Causes",
      subject: "history",
      text: "Explain how militarism, alliances, imperialism, and nationalism contributed to the outbreak of World War I.",
      modelAnswer:
        "Militarism: arms races, especially Anglo-German naval rivalry. Alliances: Triple Alliance vs Triple Entente turned a local crisis into a general war. Imperialism: competing empires, including Morocco crises. Nationalism: Slavic nationalism in the Balkans. Trigger: assassination of Archduke Franz Ferdinand in Sarajevo, 1914.",
      maxMarks: 12,
      dueDate: isoDate(-6),
      status: "graded",
      submittedAnswer:
        "Militarism meant countries built large armies and navies which made war feel inevitable. Alliances meant that if one country was attacked its partners joined in, spreading the conflict. Imperialism created rivalry over colonies. Nationalism made ethnic groups want independence and made citizens eager to support their country. Together these made Europe unstable by 1914.",
      submittedAt: isoDate(-7),
      studentName: "Alex Kumar",
      createdAt: isoDate(-14),
      ...gradedWw1,
    },
    {
      title: "Thesis Statements & Topic Sentences",
      subject: "english",
      text: "Write a clear thesis statement for an essay about the benefits and drawbacks of social media. Then write three topic sentences for body paragraphs supporting your thesis.",
      modelAnswer:
        "Thesis should take a position, e.g. social media expands access to information and community but also harms attention and mental health, so it requires deliberate limits. Topic sentences should each preview one claim: connection/information, mental health costs, and a policy or habit-based solution. Avoid vague wording like 'social media is good and bad'.",
      maxMarks: 8,
      dueDate: isoDate(4),
      status: "pending",
      submittedAnswer: null,
      submittedAt: null,
      studentName: null,
      score: null,
      feedback: null,
      evaluation: null,
      createdAt: isoDate(-3),
    },
  ];
}

module.exports = { buildSeed, isoDate };
