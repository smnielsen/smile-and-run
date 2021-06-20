
enum ILevel {
  OPE = 'OPE',
  A = 'A',
  AC = 'AC',
  C = 'C',
  SrC = 'SrC',
  AM = 'AM',
  M = 'M',
  SrM = 'SrM',
  P = 'P',
}

enum IRole {
  Consulting = 'Consulting',
  Recruitment = 'Recruitment',
  Operations = 'Operations'
}

enum IOffice {
  Berlin = 'Berlin',
  Munich = 'Munich',
  Hamburg = 'Hamburg',
  Frankfurt = 'Frankfurt',
  Stockholm = 'Stockholm',
  Oslo = 'Oslo',
  Helsinki = 'Helsinki',
  Copenhagen = 'Copenhagen',
  Zürich = 'Zürich'
}

interface IMentor {
  fullName: string
  index: number | null
}

interface INetlighter {
  id: number
  fullName: string
  email: string
  level: ILevel
  role: IRole
  rebelLink: string
  office: IOffice
  phone: string
  photo: string
  mentor: IMentor
  mentees: Array<number> // List of index positions
}

function mapNetlighter(raw: Array<any>): INetlighter {
  const [
    id, // number
    email, // string
    mentorName, // string
    levelRaw, // string
    roleRaw, // string
    rebelLink,// string
    officeRaw, // string
    fullName, // string
    phone, // string
    photoMap, // map ("0" as key)
  ] = raw
  const result: INetlighter = {
    id,
    email,
    mentor: {
      fullName: mentorName,
      index: null
    },
    level: ILevel[levelRaw as ILevel],
    role: IRole[roleRaw as IRole],
    rebelLink,
    office: IOffice[officeRaw as IOffice],
    fullName,
    phone,
    photo: photoMap["0"] || 'not-set',
    mentees: []
  }
  return result
}

function isMentor(mentor: INetlighter, mentee: INetlighter): boolean {
  return mentor.fullName === mentee.mentor.fullName
}

function aggregateMentorship(array: INetlighter[], curr: INetlighter, currentIndex: number): INetlighter[] {
  array.forEach((mentee: INetlighter, menteeIndex: number) => {
    if (isMentor(curr, mentee)) {
      curr.mentees.push(menteeIndex)
      mentee.mentor.index = currentIndex
    }
  })
  return array
}

async function toMapFromList(rawList: Array<any>): Promise<INetlighter[]> {

  const nlers = rawList.map(mapNetlighter);
  const mentorAggregated = nlers.reduce(aggregateMentorship, nlers)

  // Print
  mentorAggregated.forEach((person: INetlighter) => {
      console.log(person)
    }
  )

  return mentorAggregated
}

if (import.meta.main) {
  console.log('-- AggregateMentors - from CLI --')
  toMapFromList([
    [
      172,
      "simon.nielsen@netlight.com",
      "Felix Sprick",
      "M",
      "Consulting",
      "https://rebel.netlight.com/author/fesp/",
      "Berlin",
      "Simon Nielsen",
      "+49 152 56 89 552 1",
      {
        "0": "https://rebel.netlight.com/wp-content/uploads/userphoto/172.png"
      },
      "",
      "simon.nielsen.netlight"
    ],
    [
      2266,
      "kristina.krinizki@netlight.com",
      "Simon Nielsen",
      "C",
      "Sales",
      "https://rebel.netlight.com/author/sini/",
      "Berlin",
      "Kristina Krinizki",
      "+49 173 65 33 894",
      {
        "0": "https://rebel.netlight.com/wp-content/themes/rebel-material/img/horse_small.png"
      },
      "",
      ""
    ],
    [
      1190,
      "mina.kleid@netlight.com",
      "Simon Nielsen",
      "AM",
      "Consulting",
      "https://rebel.netlight.com/author/sini/",
      "Berlin",
      "Mina Kleid",
      "+49 162 26 89 580",
      {
        "0": "https://rebel.netlight.com/wp-content/uploads/userphoto/1190.jpg"
      },
      "",
      ""
    ],
    [
      1144,
      "per-victor.persson@netlight.com",
      "Simon Nielsen",
      "SrC",
      "Consulting",
      "https://rebel.netlight.com/author/sini/",
      "Berlin",
      "Per-Victor Persson",
      "+49 162 62 34 817",
      {
        "0": "https://rebel.netlight.com/wp-content/uploads/userphoto/1144.jpg"
      },
      "",
      ""
    ],
    [
      1986,
      "steffen.schroeder@netlight.com",
      "Simon Nielsen",
      "C",
      "Sales",
      "https://rebel.netlight.com/author/sini/",
      "Berlin",
      "Steffen Schröder",
      "+49 173 32 96 323",
      {
        "0": "https://rebel.netlight.com/wp-content/uploads/userphoto/1986.jpg"
      },
      "",
      "steffen6891"
    ],
  ]  as Array<any>)
}


/*
[
  172,
  "simon.nielsen@netlight.com",
  "Felix Sprick",
  "M",
  "Consulting",
  "https://rebel.netlight.com/author/fesp/",
  "Berlin",
  "Simon Nielsen",
  "+49 152 56 89 552 1",
  {
    "0": "https://rebel.netlight.com/wp-content/uploads/userphoto/172.png"
  },
  "",
  "simon.nielsen.netlight"
],
*/
