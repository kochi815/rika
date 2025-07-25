// アイテムのデータ
const ITEM_DATA = {
    "item001": { name: "いつものおやつ", type: "snack", description: "猫たちが大好きなカリカリ。いろんな猫が遊びに来る基本のアイテム。", attract_level: 1, price: 10 },
    "item002": { name: "ねこじゃらし", type: "toy", description: "子猫や遊び好きな猫がじゃれついてくる。見ていて飽きない。", attract_level: 1, price: 20 },
    "item003": { name: "高級マグロ缶", type: "snack", description: "グルメな猫が好む逸品。ちょっと珍しい猫が来るかも？", attract_level: 2, price: 50 },
    "item004": { name: "ふかふかベッド", type: "toy", description: "のんびり屋の猫が気持ちよさそうに眠りに来る。癒やしの光景。", attract_level: 2, price: 60 },
    "item005": { name: "毛糸玉", type: "toy", description: "転がして遊ぶのが大好き。活発な猫に特に人気。", attract_level: 3, price: 80 },
    "item006": { name: "こたつ", type: "toy", description: "特別な猫がやってくるらしい…？冬の庭の主役。満足すると…？", attract_level: 4, price: 100 }
};

// 猫のデータ（変更なし）
const CAT_DATA = {
    "cat001": { name: "しろねこさん", rarity: 1, description: "どこにでもいるマイペースな猫。", needs: [] },
    "cat002": { name: "くろねこさん", rarity: 1, description: "クールだけど、本当は甘えん坊。", needs: [] },
    "cat003": { name: "ちゃとらさん", rarity: 2, description: "人懐っこいいたずら好き。", needs: ["item002", "item005"] },
    "cat004": { name: "みけさん", rarity: 2, description: "ちょっぴり気まぐれな女の子。", needs: ["item001", "item003"] },
    "cat005": { name: "はちわれさん", rarity: 3, description: "紳士的なしっかり者。", needs: ["item004"] },
    "cat006": { name: "まんぞくさん", rarity: 5, description: "高級なおやつを全部食べてしまう食いしん坊。", needs: ["item003", "item006"] }
};