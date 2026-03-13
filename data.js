const appData = {
  meta: {
    title: "Zero Conditional | Instituto Fernando Ramirez",
    subtitleEn: "Interactive review, practice and evaluation",
    subtitleEs: "Repaso, práctica y evaluación interactiva",
    totalExercises: 30,
  },
  mindMap: {
    width: 2200,
    height: 1500,
    root: {
      id: "zero-conditional",
      title: "Zero Conditional",
      level: 0,
      x: 1100,
      y: 720,
      summaryEn:
        "The zero conditional explains results that are always true when a condition happens.",
      summaryEs:
        "El zero conditional explica resultados que siempre son verdaderos cuando ocurre una condición.",
      exampleEn: "If water reaches 100°C, it boils.",
      exampleEs: "Si el agua llega a 100 °C, hierve.",
      children: [
        "definition",
        "use",
        "structure",
        "if",
        "when",
        "present-simple",
        "punctuation",
        "common-mistakes",
        "examples",
      ],
    },
    nodes: [
      {
        id: "definition",
        title: "Definition",
        level: 1,
        parentId: "zero-conditional",
        x: 520,
        y: 250,
        curveSeed: -0.8,
        summaryEn:
          "It presents general truths, scientific facts and predictable results.",
        summaryEs:
          "Presenta verdades generales, hechos científicos y resultados previsibles.",
        exampleEn: "If you drop a ball, it falls.",
        exampleEs: "Si sueltas una pelota, cae.",
        children: [],
      },
      {
        id: "use",
        title: "Use",
        level: 1,
        parentId: "zero-conditional",
        x: 430,
        y: 660,
        curveSeed: -0.35,
        summaryEn:
          "We use it for situations that happen the same way every time.",
        summaryEs:
          "Se usa para situaciones que ocurren de la misma manera cada vez.",
        exampleEn: "If students study, they improve.",
        exampleEs: "Si los alumnos estudian, mejoran.",
        children: ["facts", "rules", "habits", "routines", "instructions"],
      },
      {
        id: "structure",
        title: "Structure",
        level: 1,
        parentId: "zero-conditional",
        x: 620,
        y: 1110,
        curveSeed: 0.4,
        summaryEn:
          "Both clauses use the present simple: If/When + present simple, present simple.",
        summaryEs:
          "Ambas cláusulas usan presente simple: If/When + presente simple, presente simple.",
        exampleEn: "If the bell rings, class starts.",
        exampleEs: "Si suena la campana, comienza la clase.",
        children: ["affirmative", "negative", "questions"],
      },
      {
        id: "if",
        title: "If",
        level: 1,
        parentId: "zero-conditional",
        x: 1030,
        y: 210,
        curveSeed: -0.2,
        summaryEn:
          "If introduces the condition that produces a regular or natural result.",
        summaryEs:
          "If introduce la condición que produce un resultado regular o natural.",
        exampleEn: "If people do not sleep, they feel tired.",
        exampleEs: "Si las personas no duermen, se sienten cansadas.",
        children: [],
      },
      {
        id: "when",
        title: "When",
        level: 1,
        parentId: "zero-conditional",
        x: 1430,
        y: 250,
        curveSeed: 0.15,
        summaryEn:
          "When often works like if in zero conditional because the result happens every time.",
        summaryEs:
          "When suele funcionar como if en zero conditional porque el resultado ocurre cada vez.",
        exampleEn: "When the teacher asks, students answer.",
        exampleEs: "Cuando la profesora pregunta, los alumnos responden.",
        children: [],
      },
      {
        id: "present-simple",
        title: "Present Simple",
        level: 1,
        parentId: "zero-conditional",
        x: 1700,
        y: 430,
        curveSeed: 0.78,
        summaryEn:
          "The condition clause and the result clause stay in the present simple.",
        summaryEs:
          "La cláusula de condición y la de resultado permanecen en presente simple.",
        exampleEn: "If Ana arrives late, she misses the first activity.",
        exampleEs: "Si Ana llega tarde, pierde la primera actividad.",
        children: [],
      },
      {
        id: "punctuation",
        title: "Punctuation",
        level: 1,
        parentId: "zero-conditional",
        x: 1640,
        y: 1010,
        curveSeed: 0.55,
        summaryEn:
          "Use a comma if the if/when clause comes first. Do not use it when the result clause starts.",
        summaryEs:
          "Usa coma si la cláusula con if/when va primero. No la uses cuando el resultado va al inicio.",
        exampleEn: "If it rains, the game stops. / The game stops if it rains.",
        exampleEs:
          "Si llueve, el juego se detiene. / El juego se detiene si llueve.",
        children: [],
      },
      {
        id: "common-mistakes",
        title: "Common mistakes",
        level: 1,
        parentId: "zero-conditional",
        x: 1110,
        y: 1290,
        curveSeed: 0.08,
        summaryEn:
          "Students often mix future forms, forget the present simple, or use the comma in the wrong place.",
        summaryEs:
          "Con frecuencia se mezclan formas de futuro, se olvida el presente simple o se coloca mal la coma.",
        exampleEn: "Incorrect: If you heat ice, it will melt.",
        exampleEs: "Incorrecto: Si calientas hielo, se derretirá.",
        children: [],
      },
      {
        id: "examples",
        title: "Examples",
        level: 1,
        parentId: "zero-conditional",
        x: 1760,
        y: 1220,
        curveSeed: 0.92,
        summaryEn:
          "Everyday and school examples help connect the structure with real actions.",
        summaryEs:
          "Los ejemplos cotidianos y escolares ayudan a vincular la estructura con acciones reales.",
        exampleEn: "If you press save, the file stays on the computer.",
        exampleEs: "Si presionas guardar, el archivo se queda en la computadora.",
        children: [],
      },
      {
        id: "facts",
        title: "Facts",
        level: 2,
        parentId: "use",
        x: 180,
        y: 470,
        curveSeed: -0.75,
        summaryEn:
          "Facts describe things that are true in nature, science or daily life.",
        summaryEs:
          "Los hechos describen cosas verdaderas en la naturaleza, la ciencia o la vida diaria.",
        exampleEn: "If you heat metal, it expands.",
        exampleEs: "Si calientas metal, se expande.",
        children: [],
      },
      {
        id: "rules",
        title: "Rules",
        level: 2,
        parentId: "use",
        x: 170,
        y: 620,
        curveSeed: -0.22,
        summaryEn:
          "Rules explain what happens or what people do in a regulated situation.",
        summaryEs:
          "Las reglas explican qué pasa o qué hace la gente en una situación regulada.",
        exampleEn: "If students arrive late, they sign the report book.",
        exampleEs: "Si los alumnos llegan tarde, firman la libreta de reportes.",
        children: [],
      },
      {
        id: "habits",
        title: "Habits",
        level: 2,
        parentId: "use",
        x: 200,
        y: 790,
        curveSeed: 0.1,
        summaryEn:
          "Habits are repeated personal actions that usually cause the same result.",
        summaryEs:
          "Los hábitos son acciones personales repetidas que suelen causar el mismo resultado.",
        exampleEn: "If Luis drinks coffee at night, he sleeps late.",
        exampleEs: "Si Luis toma café en la noche, se duerme tarde.",
        children: [],
      },
      {
        id: "routines",
        title: "Routines",
        level: 2,
        parentId: "use",
        x: 350,
        y: 960,
        curveSeed: 0.46,
        summaryEn:
          "Routines show organized actions that repeat on school days or at home.",
        summaryEs:
          "Las rutinas muestran acciones organizadas que se repiten en días de clase o en casa.",
        exampleEn: "When the first class ends, students go to break.",
        exampleEs: "Cuando termina la primera clase, los alumnos salen al receso.",
        children: [],
      },
      {
        id: "instructions",
        title: "Instructions",
        level: 2,
        parentId: "use",
        x: 140,
        y: 1120,
        curveSeed: 0.88,
        summaryEn:
          "Instructions tell the listener what result appears after an action.",
        summaryEs:
          "Las instrucciones indican qué resultado aparece después de una acción.",
        exampleEn: "If you click print, the document comes out.",
        exampleEs: "Si haces clic en imprimir, el documento sale.",
        children: [],
      },
      {
        id: "affirmative",
        title: "Affirmative",
        level: 2,
        parentId: "structure",
        x: 850,
        y: 1380,
        curveSeed: -0.4,
        summaryEn:
          "Affirmative zero conditional sentences keep both verbs in the affirmative present simple.",
        summaryEs:
          "Las oraciones afirmativas mantienen ambos verbos en presente simple afirmativo.",
        exampleEn: "If the projector works, the lesson starts on time.",
        exampleEs: "Si el proyector funciona, la clase empieza a tiempo.",
        children: [],
      },
      {
        id: "negative",
        title: "Negative",
        level: 2,
        parentId: "structure",
        x: 1110,
        y: 1450,
        curveSeed: 0.18,
        summaryEn:
          "Negative sentences use do not or does not in the clause that needs negation.",
        summaryEs:
          "Las oraciones negativas usan do not o does not en la cláusula que necesita negación.",
        exampleEn: "If the team does not practice, it does not improve.",
        exampleEs: "Si el equipo no practica, no mejora.",
        children: [],
      },
      {
        id: "questions",
        title: "Questions",
        level: 2,
        parentId: "structure",
        x: 1370,
        y: 1370,
        curveSeed: 0.7,
        summaryEn:
          "Questions ask about the usual result and use do or does in present simple.",
        summaryEs:
          "Las preguntas consultan el resultado habitual y usan do o does en presente simple.",
        exampleEn: "What happens if you mix blue and yellow?",
        exampleEs: "¿Qué pasa si mezclas azul y amarillo?",
        children: [],
      },
    ],
  },
  matching: [
    {
      id: "m1",
      term: "Zero conditional",
      definition:
        "A conditional form used for facts, routines, rules and results that always happen.",
      bilingualNote: "Condicional para hechos y resultados constantes.",
    },
    {
      id: "m2",
      term: "General truth",
      definition:
        "An idea that stays true in the same way every time, not only today.",
      bilingualNote: "Verdad general que no depende de un momento específico.",
    },
    {
      id: "m3",
      term: "Fact",
      definition:
        "A statement that describes a real and verifiable result, often scientific or observable.",
      bilingualNote: "Hecho comprobable.",
    },
    {
      id: "m4",
      term: "Routine",
      definition:
        "A repeated action or sequence that happens regularly in class or daily life.",
      bilingualNote: "Acción repetida en la vida diaria o escolar.",
    },
    {
      id: "m5",
      term: "Habit",
      definition:
        "A personal repeated action that usually creates the same consequence.",
      bilingualNote: "Acción personal repetida con consecuencia habitual.",
    },
    {
      id: "m6",
      term: "Rule",
      definition:
        "A regulation or norm that explains what people do when a condition appears.",
      bilingualNote: "Norma o regulación.",
    },
    {
      id: "m7",
      term: "Instruction",
      definition:
        "A direction that shows the result of pressing, choosing or doing something.",
      bilingualNote: "Indicación que activa un resultado.",
    },
    {
      id: "m8",
      term: "If clause",
      definition:
        "The part that presents the condition in a zero conditional sentence.",
      bilingualNote: "Cláusula que expresa la condición.",
    },
    {
      id: "m9",
      term: "Result clause",
      definition:
        "The part that explains the regular consequence of the condition.",
      bilingualNote: "Cláusula que expresa la consecuencia.",
    },
    {
      id: "m10",
      term: "Present simple",
      definition:
        "The verb tense used in both clauses of the zero conditional.",
      bilingualNote: "Tiempo verbal de ambas cláusulas.",
    },
    {
      id: "m11",
      term: "Punctuation",
      definition:
        "The writing system that helps place the comma correctly when the condition comes first.",
      bilingualNote: "Signos que ordenan la oración.",
    },
    {
      id: "m12",
      term: "Comma",
      definition:
        "The sign used after the if/when clause when that clause starts the sentence.",
      bilingualNote: "Coma después de la condición inicial.",
    },
    {
      id: "m13",
      term: "If",
      definition:
        "The connector that introduces a condition and can often alternate with when in this topic.",
      bilingualNote: "Conector de condición.",
    },
    {
      id: "m14",
      term: "When",
      definition:
        "The connector that introduces a repeated condition with a regular result.",
      bilingualNote: "Conector para condiciones repetidas.",
    },
    {
      id: "m15",
      term: "Cause and effect",
      definition:
        "The relation in which one action regularly produces the same result.",
      bilingualNote: "Relación entre causa y resultado.",
    },
  ],
  quiz: {
    trueFalse: [
      {
        id: "q1",
        prompt:
          "Zero conditional sentences describe results that are always true when the condition happens.",
        answer: true,
        explanationEn:
          "Correct. The zero conditional describes predictable, repeated or universal results.",
        explanationEs:
          "Correcto. El zero conditional describe resultados previsibles, repetidos o universales.",
      },
      {
        id: "q2",
        prompt:
          "In the zero conditional, one clause usually uses will to express the result.",
        answer: false,
        explanationEn:
          "Correct. Zero conditional uses the present simple in both clauses, not will.",
        explanationEs:
          "Correcto. El zero conditional usa presente simple en ambas cláusulas, no will.",
      },
      {
        id: "q3",
        prompt:
          "In many zero conditional sentences, when can replace if without changing the basic meaning.",
        answer: true,
        explanationEn:
          "Correct. If and when often work in the same way when the result is regular.",
        explanationEs:
          "Correcto. If y when suelen funcionar igual cuando el resultado es habitual.",
      },
      {
        id: "q4",
        prompt:
          "A comma is required even when the result clause appears before the if clause.",
        answer: false,
        explanationEn:
          "Correct. The comma is usually needed only when the if or when clause comes first.",
        explanationEs:
          "Correcto. La coma suele necesitarse solo cuando la cláusula con if o when va primero.",
      },
      {
        id: "q5",
        prompt:
          "Zero conditional can be used for instructions such as software or classroom directions.",
        answer: true,
        explanationEn:
          "Correct. Instructions often show the direct result of an action, so zero conditional fits well.",
        explanationEs:
          "Correcto. Las instrucciones suelen mostrar el resultado directo de una acción, por eso el zero conditional funciona bien.",
      },
    ],
    multipleChoice: [
      {
        id: "q6",
        prompt: "If you heat water to 100°C, it ____.",
        options: [
          { key: "a", text: "boiled" },
          { key: "b", text: "boils" },
          { key: "c", text: "will boil" },
          { key: "d", text: "is boiling" },
          { key: "e", text: "boil" },
        ],
        answer: "b",
        explanationEn:
          "Boils is correct because the sentence expresses a scientific fact in the present simple.",
        explanationEs:
          "Boils es correcto porque la oración expresa un hecho científico en presente simple.",
      },
      {
        id: "q7",
        prompt: "Which sentence is a correct zero conditional example?",
        options: [
          { key: "a", text: "If students study, they will pass faster." },
          { key: "b", text: "If students studied, they passed the course." },
          { key: "c", text: "If students study regularly, they understand more." },
          { key: "d", text: "If students will study, they understand more." },
          { key: "e", text: "If students are studying, they understand more." },
        ],
        answer: "c",
        explanationEn:
          "Option c uses the present simple in both clauses and describes a repeated result.",
        explanationEs:
          "La opción c usa presente simple en ambas cláusulas y describe un resultado repetido.",
      },
      {
        id: "q8",
        prompt:
          "Which connector often replaces if in zero conditional sentences about repeated results?",
        options: [
          { key: "a", text: "because" },
          { key: "b", text: "when" },
          { key: "c", text: "although" },
          { key: "d", text: "unless" },
          { key: "e", text: "before" },
        ],
        answer: "b",
        explanationEn:
          "When can often replace if because both can introduce a repeated condition here.",
        explanationEs:
          "When puede reemplazar con frecuencia a if porque ambos pueden introducir una condición repetida aquí.",
      },
      {
        id: "q9",
        prompt:
          "Which tense is normally used in both parts of a zero conditional sentence?",
        options: [
          { key: "a", text: "Past simple" },
          { key: "b", text: "Present continuous" },
          { key: "c", text: "Future simple" },
          { key: "d", text: "Present simple" },
          { key: "e", text: "Present perfect" },
        ],
        answer: "d",
        explanationEn:
          "Present simple appears in the condition clause and the result clause.",
        explanationEs:
          "El presente simple aparece tanto en la cláusula de condición como en la de resultado.",
      },
      {
        id: "q10",
        prompt:
          "Choose the sentence with correct punctuation when the condition comes first.",
        options: [
          { key: "a", text: "If the bell rings students enter the classroom." },
          { key: "b", text: "If the bell rings, students enter the classroom." },
          { key: "c", text: "Students enter the classroom, if the bell rings." },
          { key: "d", text: "If the bell, rings students enter the classroom." },
          { key: "e", text: "If the bell rings; students enter the classroom." },
        ],
        answer: "b",
        explanationEn:
          "Option b places the comma after the if clause because the condition starts the sentence.",
        explanationEs:
          "La opción b coloca la coma después de la cláusula con if porque la condición inicia la oración.",
      },
    ],
    completeSentence: [
      {
        id: "q11",
        prompt: "If you ___ the red button, the alarm sounds.",
        options: ["press", "pressed", "will press"],
        answer: 0,
        explanationEn:
          "Press is correct because zero conditional keeps the condition in the present simple.",
        explanationEs:
          "Press es correcto porque el zero conditional mantiene la condición en presente simple.",
      },
      {
        id: "q12",
        prompt: "When Diego ___ home late, he misses the school bus.",
        options: ["leave", "leaves", "left"],
        answer: 1,
        explanationEn:
          "Leaves is correct because Diego is third person singular in the present simple.",
        explanationEs:
          "Leaves es correcto porque Diego está en tercera persona singular en presente simple.",
      },
      {
        id: "q13",
        prompt: "If teachers ___ clear instructions, students follow the process more easily.",
        options: ["gives", "gave", "give"],
        answer: 2,
        explanationEn:
          "Give is correct because teachers is plural and the sentence expresses a repeated result.",
        explanationEs:
          "Give es correcto porque teachers es plural y la oración expresa un resultado repetido.",
      },
      {
        id: "q14",
        prompt: "If a plant ___ enough water, it grows well.",
        options: ["gets", "get", "got"],
        answer: 0,
        explanationEn:
          "Gets is correct because the subject is singular and the idea is a general fact.",
        explanationEs:
          "Gets es correcto porque el sujeto es singular y la idea es un hecho general.",
      },
      {
        id: "q15",
        prompt: "When the library ___, students go inside quietly.",
        options: ["open", "opens", "opened"],
        answer: 1,
        explanationEn:
          "Opens is correct because the library is singular and the sentence states a routine.",
        explanationEs:
          "Opens es correcto porque the library es singular y la oración expresa una rutina.",
      },
    ],
  },
};

window.appData = appData;
