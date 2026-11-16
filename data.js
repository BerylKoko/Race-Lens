/* Race Lens — scoped 2025 Las Vegas Grand Prix reference fixture.
   Sources: FIA qualifying classification, FIA pit-stop detail, FIA race lap chart;
   F1 official amended race result. Lap positions here are deliberately SELECTED
   historical checkpoints, not an export of an entire lap table. */
const RACE = {
    title: '2025 Las Vegas Grand Prix',
    venue: 'Las Vegas Strip Circuit',
    date: '22 Nov 2025 (local)',
    totalLaps: 50,
    dataUpdated: '15 Nov 2026',
    sources: {
        qualifying: 'https://api.fia.com/events/fia-formula-one-world-championship/season-2025/las-vegas-grand-prix/session-classifications',
        pits: 'https://www.fia.com/events/fia-formula-one-world-championship/season-2025/las-vegas-grand-prix/race-qualification',
        lapChart: 'https://www.fia.com/sites/default/files/2025_22_usa_f1_r0_timing_racelapchart_v01.pdf',
        history: 'https://www.fia.com/sites/default/files/2025_22_usa_f1_r0_timing_racehistorychart_v01.pdf',
        result: 'https://www.formula1.com/en/results/2025/races/1274/las-vegas/race-result',
        tyre: 'https://f1tracker.app/race/22?season=2025',
        sectors: 'https://en.mclarenf-1.com/2025/gp/1169/',
        lapTimes: 'https://api.jolpi.ca/ergast/f1/2025/22/laps/?limit=2000'
    }
};
// Each driver row includes the car number, team, tyre plan, and Q1/Q2/Q3 times.
// A null qualifying time means the driver did not record a time in that session.
// Q1–Q3 official best session times; missing rounds mean driver was eliminated.
const DRIVERS = [
    [
        'VER',
        1,
        'Max Verstappen',
        'Red Bull Racing',
        '#5e89ff',
        1,
        'Medium',
        'Hard',
        25,
        '1:53.458',
        '1:51.593',
        '1:48.257'
    ],
    [
        'RUS',
        63,
        'George Russell',
        'Mercedes',
        '#75e4d8',
        2,
        'Medium',
        'Hard',
        17,
        '1:53.144',
        '1:50.935',
        '1:48.803'
    ],
    [
        'ANT',
        12,
        'Kimi Antonelli',
        'Mercedes',
        '#75e4d8',
        3,
        'Soft',
        'Hard',
        2,
        '1:56.314',
        null,
        null
    ],
    [
        'LEC',
        16,
        'Charles Leclerc',
        'Ferrari',
        '#ff5d6b',
        4,
        'Medium',
        'Hard',
        24,
        '1:54.814',
        '1:51.952',
        '1:49.872'
    ],
    [
        'SAI',
        55,
        'Carlos Sainz',
        'Williams',
        '#7db9ff',
        5,
        'Medium',
        'Hard',
        22,
        '1:54.873',
        '1:51.144',
        '1:48.296'
    ],
    [
        'HAD',
        6,
        'Isack Hadjar',
        'Racing Bulls',
        '#acb5ff',
        6,
        'Medium',
        'Hard',
        20,
        '1:55.613',
        '1:51.120',
        '1:49.554'
    ],
    [
        'HUL',
        27,
        'Nico Hülkenberg',
        'Kick Sauber',
        '#9ee489',
        7,
        'Hard',
        'Medium',
        30,
        '1:54.555',
        '1:52.781',
        null
    ],
    [
        'HAM',
        44,
        'Lewis Hamilton',
        'Ferrari',
        '#ff5d6b',
        8,
        'Hard',
        'Medium',
        29,
        '1:57.115',
        null,
        null
    ],
    [
        'OCO',
        31,
        'Esteban Ocon',
        'Haas',
        '#aab0c4',
        9,
        'Medium',
        'Hard',
        27,
        '1:54.635',
        '1:52.987',
        null
    ],
    [
        'BEA',
        87,
        'Oliver Bearman',
        'Haas',
        '#aab0c4',
        10,
        'Medium',
        'Hard',
        17,
        '1:56.016',
        '1:53.094',
        null
    ],
    [
        'ALO',
        14,
        'Fernando Alonso',
        'Aston Martin',
        '#5dd1a9',
        11,
        'Medium',
        'Hard',
        16,
        '1:53.739',
        '1:51.865',
        '1:49.466'
    ],
    [
        'TSU',
        22,
        'Yuki Tsunoda',
        'Red Bull Racing',
        '#5e89ff',
        12,
        'Hard',
        'Medium',
        27,
        '1:56.798',
        null,
        null
    ],
    [
        'GAS',
        10,
        'Pierre Gasly',
        'Alpine',
        '#ff9cc9',
        13,
        'Hard',
        'Hard',
        2,
        '1:54.432',
        '1:51.760',
        '1:51.540'
    ],
    [
        'LAW',
        30,
        'Liam Lawson',
        'Racing Bulls',
        '#acb5ff',
        14,
        'Hard',
        'Hard',
        28,
        '1:54.828',
        '1:51.621',
        '1:49.062'
    ],
    [
        'COL',
        43,
        'Franco Colapinto',
        'Alpine',
        '#ff9cc9',
        15,
        'Hard',
        'Medium',
        25,
        '1:54.847',
        '1:53.683',
        null
    ],
    [
        'ALB',
        23,
        'Alexander Albon',
        'Williams',
        '#7db9ff',
        null,
        'Hard',
        'Hard',
        13,
        '1:56.220',
        null,
        null
    ],
    [
        'BOR',
        5,
        'Gabriel Bortoleto',
        'Kick Sauber',
        '#9ee489',
        null,
        null,
        null,
        1,
        '1:56.674',
        null,
        null
    ],
    [
        'STR',
        18,
        'Lance Stroll',
        'Aston Martin',
        '#5dd1a9',
        null,
        null,
        null,
        null,
        '1:54.416',
        '1:52.850',
        null
    ],
    [
        'NOR',
        4,
        'Lando Norris',
        'McLaren',
        '#ffbd79',
        null,
        'Medium',
        'Hard',
        22,
        '1:55.473',
        '1:51.379',
        '1:47.934'
    ],
    [
        'PIA',
        81,
        'Oscar Piastri',
        'McLaren',
        '#ffbd79',
        null,
        'Medium',
        'Hard',
        21,
        '1:54.544',
        '1:52.126',
        '1:48.961'
    ]
].map(([code, num, name, team, color, result, startTyre, newTyre, firstRelevantTyreChange, q1, q2, q3]) => ({
    code,
    num,
    name,
    team,
    color,
    result,
    startTyre,
    newTyre,
    firstRelevantTyreChange,
    q: [q1, q2, q3]
}));
const BY_CODE = Object.fromEntries(DRIVERS.map(d => [d.code, d]));
const BY_NUM = Object.fromEntries(DRIVERS.map(d => [d.num, d]));
const PIT_STOPS = {
    VER: [25],
    RUS: [17],
    ANT: [2],
    LEC: [24],
    SAI: [22],
    HAD: [20],
    HUL: [30],
    HAM: [29],
    OCO: [27],
    BEA: [17],
    ALO: [16],
    TSU: [1, 27],
    GAS: [2],
    LAW: [2, 28],
    COL: [25],
    ALB: [13, 14, 34],
    BOR: [1],
    STR: [],
    NOR: [22],
    PIA: [21]
};
const MAX_LAP = {
    ALB: 35,
    BOR: 2,
    STR: 0,
    LAW: 49,
    COL: 49
};
// Selected verified ON-TRACK running orders, by car number, at lap completion.
// The interface never fabricates intermediate order changes: it explicitly shows
// the last verified checkpoint when the slider is between snapshots.
const ORDERS = {
    1: '1 63 4 55 6 30 81 87 16 14 27 31 44 12 23 43 10 22 5',
    2: '1 63 4 55 6 81 87 16 14 27 31 44 23 12 43 30 10 22 5',
    12: '1 63 4 55 6 16 81 87 14 27 31 44 23 12 43 22 10 30',
    16: '1 63 4 55 16 81 6 87 27 31 44 14 12 43 22 10 30 23',
    17: '1 4 63 55 16 81 6 27 31 44 87 12 43 22 14 10 30 23',
    21: '1 4 55 16 63 81 27 44 31 12 6 43 22 14 87 10 30 23',
    22: '1 4 16 63 55 27 44 31 12 81 6 14 43 22 87 10 30 23',
    24: '1 63 4 16 27 44 12 31 81 55 6 14 87 43 22 10 30 23',
    25: '1 63 4 27 44 12 31 81 16 55 6 14 87 22 10 30 43 23',
    29: '1 63 4 27 12 44 81 16 55 6 14 87 31 10 22 43 23 30',
    30: '1 63 4 12 27 81 16 55 6 44 14 87 31 10 22 43 23 30',
    35: '1 4 63 12 81 16 55 6 27 44 31 87 14 10 22 43 30 23',
    40: '1 4 63 12 81 16 55 6 27 44 31 87 14 10 22 30 43',
    49: '1 4 63 12 81 16 55 6 27 44 31 87 14 22 10 30 43',
    50: '1 4 63 12 81 16 55 6 27 44 31 87 14 22 10'
};
Object.entries(ORDERS).forEach(([k, s]) => {
    ORDERS[k] = s.split(' ').map(num => BY_NUM[Number(num)]?.code).filter(Boolean);
});
// Selective FIA race history timing checkpoints; gaps to race leader, seconds.
// Unlisted laps can be populated at runtime from historical per-lap times.
// Race chart gaps reflect ON-TRACK timing, before post-race penalties. 'PIT' flags a pit crossing.
const GAPS = {
    1: {
        VER: 0,
        RUS: 1.013,
        NOR: 2.103,
        LEC: 6.290,
        HAM: 8.062
    },
    2: {
        VER: 0,
        RUS: 2.642,
        NOR: 4.537,
        LEC: 13.104,
        HAM: 19.016
    },
    24: {
        VER: 0,
        RUS: 21.966,
        NOR: 24.777,
        LEC: 'PIT',
        HAM: 29.952
    },
    29: {
        VER: 0,
        RUS: 2.334,
        NOR: 5.339,
        LEC: 21.241,
        HAM: 'PIT'
    },
    50: {
        VER: 0,
        NOR: 20.741,
        RUS: 23.546,
        ANT: 25.488,
        PIA: 27.650,
        LEC: 30.678,
        SAI: 34.924,
        HAD: 45.257,
        HUL: 51.134,
        HAM: 59.369,
        OCO: 60.635,
        BEA: 70.549,
        ALO: 85.308,
        TSU: 86.974,
        GAS: 91.702
    }
};
// Best race sector times (not necessarily from the same lap): sourced from
// F1 2025 Las Vegas results dataset on mclarenf-1.com.
const SECTORS = {
    VER: [26.350, 31.156, 35.859],
    NOR: [26.651, 31.177, 35.938],
    ANT: [26.532, 31.380, 35.949],
    PIA: [26.763, 31.477, 35.756],
    LEC: [26.798, 31.337, 35.960],
    HAM: [26.937, 31.367, 36.061],
    SAI: [26.877, 31.498, 35.993],
    RUS: [26.975, 31.646, 35.954],
    HAD: [26.693, 31.628, 36.278],
    HUL: [26.864, 31.509, 36.185],
    OCO: [26.968, 31.574, 35.881],
    BEA: [26.907, 31.529, 36.083],
    ALO: [27.151, 32.032, 36.242],
    GAS: [27.269, 31.855, 36.395],
    LAW: [27.096, 31.520, 35.973],
    TSU: [26.974, 31.736, 36.043],
    ALB: [27.070, 31.770, 36.010],
    COL: [27.263, 31.781, 36.402]
};
const EVENTS = [
    {
        lap: 1,
        title: 'Lights out',
        detail: 'Verstappen takes the lead on Lap 1. Norris falls from pole to third.'
    },
    {
        lap: 2,
        title: 'Early stops',
        detail: 'Antonelli makes an early stop; the race runs under changing conditions.'
    },
    {
        lap: 16,
        title: 'Field reshuffle',
        detail: 'Alonso stops on lap 16; a brief virtual safety car is called for debris.'
    },
    {
        lap: 21,
        title: 'Piastri pits',
        detail: 'Piastri stops on lap 21; the order changes as strategies split.'
    },
    {
        lap: 24,
        title: 'Leclerc pits',
        detail: 'Leclerc makes his first stop on lap 24. Compare with Hamilton’s later stop.'
    },
    {
        lap: 25,
        title: 'Leader pits',
        detail: 'Verstappen makes his first stop on lap 25 and keeps the lead.'
    },
    {
        lap: 29,
        title: 'Hamilton pits',
        detail: 'Hamilton makes his first stop on lap 29, five laps after Leclerc.'
    },
    {
        lap: 50,
        title: 'Finish and revision',
        detail: 'Verstappen wins on track. Norris and Piastri are subsequently disqualified; final classification changes.'
    }
];
