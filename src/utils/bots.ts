
export interface BotProfile {
    id: string;
    name: string;
    rating: number;
    avatar: string;
    flag: string;
    description: string;
    skillLevel: number; // 0-20
    depth: number;
}

export const BEGINNER_BOTS: BotProfile[] = [
    {
        id: 'martin',
        name: 'Martin',
        rating: 250,
        avatar: 'https://images.chesscomfiles.com/uploads/v1/user/165768852.17066896.200x200o.e40702464731.jpeg',
        flag: 'https://upload.wikimedia.org/wikipedia/commons/9/9a/Flag_of_Bulgaria.svg',
        description: "I can't wait to play with you! I'm still learning, but I'll try my best.",
        skillLevel: 0,
        depth: 1
    },
    {
        id: 'elani',
        name: 'Elani',
        rating: 400,
        avatar: 'https://images.chesscomfiles.com/uploads/v1/user/36423376.50535356.200x200o.70932845c088.jpeg',
        flag: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ef/Flag_of_Saint_Kitts_and_Nevis.svg/200px-Flag_of_Saint_Kitts_and_Nevis.svg.png',
        description: "Hi! I'm Elani. I play chess for fun. Let's have a good game!",
        skillLevel: 2,
        depth: 3
    },
    {
        id: 'mittens',
        name: 'Mittens',
        rating: 1,
        avatar: 'https://images.chesscomfiles.com/uploads/v1/user/125304386.53697669.200x200o.9f2913e1628d.jpeg',
        flag: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/Flag_of_the_United_States.svg/200px-Flag_of_the_United_States.svg.png',
        description: "Meow! I like chess. Do you like chess?",
        skillLevel: 20,
        depth: 22
    },
    {
        id: 'aron',
        name: 'Aron',
        rating: 700,
        avatar: 'https://images.chesscomfiles.com/uploads/v1/user/36423380.01633519.200x200o.748722201402.jpeg',
        flag: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e8/Flag_of_Ecuador.svg/200px-Flag_of_Ecuador.svg.png',
        description: "Chess is all about strategy. Think before you move!",
        skillLevel: 5,
        depth: 5
    },
];

export const INTERMEDIATE_BOTS: BotProfile[] = [
    {
        id: 'emir',
        name: 'Emir',
        rating: 1000,
        avatar: 'https://images.chesscomfiles.com/uploads/v1/user/36423384.80875416.200x200o.d23192023199.jpeg',
        flag: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b4/Flag_of_Turkey.svg/200px-Flag_of_Turkey.svg.png',
        description: "I've been studying openings. Prepared for a challenge?",
        skillLevel: 8,
        depth: 8
    },
    {
        id: 'sven',
        name: 'Sven',
        rating: 1200,
        avatar: 'https://images.chesscomfiles.com/uploads/v1/user/36423386.d5252f9a.200x200o.b01103038626.jpeg',
        flag: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/bc/Flag_of_Finland.svg/200px-Flag_of_Finland.svg.png',
        description: "Consistency is key. I make few mistakes.",
        skillLevel: 10,
        depth: 10
    },
    {
        id: 'nelson',
        name: 'Nelson',
        rating: 1300,
        avatar: 'https://images.chesscomfiles.com/uploads/v1/user/36423390.62725203.200x200o.662660060936.jpeg',
        flag: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/Flag_of_the_United_States.svg/200px-Flag_of_the_United_States.svg.png',
        description: "Watch out for my Queen! I love aggressive play.",
        skillLevel: 11,
        depth: 11
    },
];

export const ADVANCED_BOTS: BotProfile[] = [
    {
        id: 'antonio',
        name: 'Antonio',
        rating: 1500,
        avatar: 'https://images.chesscomfiles.com/uploads/v1/user/36423396.f8007204.200x200o.364402636608.jpeg',
        flag: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/Flag_of_Spain.svg/200px-Flag_of_Spain.svg.png',
        description: "Solid positional play is my style. Can you break my defense?",
        skillLevel: 13,
        depth: 13
    },
    {
        id: 'isabel',
        name: 'Isabel',
        rating: 1600,
        avatar: 'https://images.chesscomfiles.com/uploads/v1/user/36423400.95759086.200x200o.520443226298.jpeg',
        flag: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Flag_of_Brazil.svg/200px-Flag_of_Brazil.svg.png',
        description: "I calculate deeply. Don't leave any loose pieces!",
        skillLevel: 14,
        depth: 14
    },
    {
        id: 'wemerson',
        name: 'Wemerson',
        rating: 1800,
        avatar: 'https://images.chesscomfiles.com/uploads/v1/user/36423408.2cbbe592.200x200o.8582103f5686.jpeg',
        flag: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fb/Flag_of_Angola.svg/200px-Flag_of_Angola.svg.png',
        description: "Endgames are my specialty. Try to keep up.",
        skillLevel: 16,
        depth: 16
    }
];

export const MASTER_BOTS: BotProfile[] = [
    {
        id: 'li',
        name: 'Li',
        rating: 2000,
        avatar: 'https://images.chesscomfiles.com/uploads/v1/user/36423412.72370605.200x200o.447470462067.jpeg',
        flag: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Flag_of_the_People%27s_Republic_of_China.svg/200px-Flag_of_the_People%27s_Republic_of_China.svg.png',
        description: "I play at a master level. Prepare yourself.",
        skillLevel: 18,
        depth: 18
    },
    {
        id: 'komodo',
        name: 'Komodo',
        rating: 2400,
        avatar: 'https://images.chesscomfiles.com/uploads/v1/user/29034334.a3130380.200x200o.83f885ba7130.png',
        flag: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9f/Flag_of_Indonesia.svg/200px-Flag_of_Indonesia.svg.png',
        description: "My play is dynamic and relentless. Can you withstand the pressure?",
        skillLevel: 19,
        depth: 20
    },
    {
        id: 'stockfish',
        name: 'Stockfish',
        rating: 3200,
        avatar: 'https://images.chesscomfiles.com/uploads/v1/user/17094202.94994200.200x200o.c81530260796.png',
        flag: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b7/Flag_of_Europe.svg/200px-Flag_of_Europe.svg.png',
        description: "I am the strongest chess engine. Good luck.",
        skillLevel: 20,
        depth: 22
    }
];

export const ALL_BOTS = [...BEGINNER_BOTS, ...INTERMEDIATE_BOTS, ...ADVANCED_BOTS, ...MASTER_BOTS];
