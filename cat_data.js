// アイテムのデータ
// attract_level: 高いほどレアな猫を引きつけやすい
const ITEM_DATA = {
    "item001": { name: "いつものおやつ", type: "snack", description: "猫たちが大好きなカリカリ。", attract_level: 1 },
    "item002": { name: "ねこじゃらし", type: "toy", description: "子猫がじゃれついてくる。", attract_level: 1 },
    "item003": { name: "高級マグロ缶", type: "snack", description: "グルメな猫が好む逸品。", attract_level: 2 },
    "item004": { name: "ふかふかベッド", type: "toy", description: "のんびり屋の猫が眠りに来る。", attract_level: 2 },
    "item005": { name: "毛糸玉", type: "toy", description: "転がして遊ぶのが大好き。", attract_level: 3 },
    "item006": { name: "こたつ", type: "toy", description: "特別な猫がやってくるらしい…？", attract_level: 4 }
};

// 猫のデータ
// rarity: 高いほど現れにくい
// needs: このアイテムがないと現れない（空っぽならどのアイテムでも来る可能性がある）
const CAT_DATA = {
    "cat001": { name: "しろねこさん", rarity: 1, description: "どこにでもいるマイペースな猫。", needs: [] },
    "cat002": { name: "くろねこさん", rarity: 1, description: "クールだけど、本当は甘えん坊。", needs: [] },
    "cat003": { name: "ちゃとらさん", rarity: 2, description: "人懐っこいいたずら好き。", needs: ["item002", "item005"] },
    "cat004": { name: "みけさん", rarity: 2, description: "ちょっぴり気まぐれな女の子。", needs: ["item001", "item003"] },
    "cat005": { name: "はちわれさん", rarity: 3, description: "紳士的なしっかり者。", needs: ["item004"] },
    "cat006": { name: "まんぞくさん", rarity: 5, description: "高級なおやつを全部食べてしまう食いしん坊。", needs: ["item003", "item006"] }
};