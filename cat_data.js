// cat_data.js
// アイテムのデータ
const ITEM_DATA = {
    "item001": { name: "いつものおやつ", type: "snack", description: "猫たちが大好きなカリカリ。いろんな猫が遊びに来る基本のアイテム。", attract_level: 1, price: 10 },
    "item002": { name: "ねこじゃらし", type: "toy", description: "子猫や遊び好きな猫がじゃれついてくる。見ていて飽きない。", attract_level: 1, price: 20 },
    "item003": { name: "高級マグロ缶", type: "snack", description: "グルメな猫が好む逸品。ちょっと珍しい猫が来るかも？", attract_level: 2, price: 50 },
    "item004": { name: "ふかふかベッド", type: "toy", description: "のんびり屋の猫が気持ちよさそうに眠りに来る。癒やしの光景。", attract_level: 2, price: 60 },
    "item005": { name: "毛糸玉", type: "toy", description: "転がして遊ぶのが大好き。活発な猫に特に人気。", attract_level: 3, price: 80 },
    "item006": { name: "こたつ", type: "toy", description: "特別な猫がやってくるらしい…？冬の庭の主役。満足すると…？", attract_level: 4, price: 100 },
    "item007": { name: "カラフルボール", type: "toy", description: "転がるボールを追いかけるのが大好き！遊び盛りの猫にぴったり。", attract_level: 2, price: 40 },
    "item008": { name: "爪とぎポール", type: "toy", description: "バリバリ爪をといでストレス発散！きちょうめんな猫に好まれる。", attract_level: 3, price: 90 },
    "item009": { name: "キャットタワー", type: "toy", description: "みんなが集まる豪華なタワー。高いところからお庭をながめるのが王者のしるし？", attract_level: 4, price: 150 }
};

// 猫のデータ
const CAT_DATA = {
    "cat001": { name: "しろたまさん", rarity: 1, description: "のんびり屋さんで、ひなたぼっこが大好き。ミルクティーを飲むのが夢らしい。", needs: [] },
    "cat002": { name: "くろまめさん", rarity: 1, description: "ツンデレな性格だけど、本当は甘えん坊。狭いところに入り込むのが得意。", needs: [] },
    "cat003": { name: "くりーむさん", rarity: 2, description: "甘いものが大好きな食いしん坊。特にマカロンには目がないみたい。", needs: ["item003"] },
    "cat004": { name: "おむすびさん", rarity: 2, description: "わんぱくで元気いっぱい。白米が大好きで、お椀に入ってごはんを待っている。", needs: ["item001", "item003"] },
    "cat005": { name: "ごま塩さん", rarity: 3, description: "物静かな読書家。知的な雰囲気で、他の猫たちに勉強を教えているとかいないとか。", needs: ["item004"] },
    "cat006": { name: "しろまるさん", rarity: 2, description: "いつでもにこにこ、みんなの人気者。ひよことおしゃべりするのが日課。", needs: ["item002", "item007"] },
    "cat007": { name: "ちゃちゃまるさん", rarity: 3, description: "ひよこと大の仲良し。いつも一緒に行動していて、さみしがり屋な一面も。", needs: ["item007", "item008"] },
    "cat008": { name: "しましまさん", rarity: 3, description: "りょうりが得意な猫。じまんの魚料理をみんなにふるまいたいと思っている。", needs: ["item003", "item005"] },
    "cat009": { name: "ねこキング", rarity: 5, description: "お庭に住まうすべての猫の王。キャットタワーの頂上からみんなを見守っている。", needs: ["item009"] }
};