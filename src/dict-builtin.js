/**
 * Built-in Simple Dictionary Provider
 * 
 * A simple dictionary with hardcoded vocabulary.
 * Can be replaced with cc-cedict or any other dictionary provider.
 */

import { 
  normalizePinyin,
  createWordId
} from './dict-provider.js';

// Built-in vocabulary data
const categories = [
  { id: 'numbers', name: 'Numbers / 数字', color: '#FF6B6B', description: 'Basic numbers 1-10' },
  { id: 'colors', name: 'Colors / 颜色', color: '#4ECDC4', description: 'Basic colors' },
  { id: 'animals', name: 'Animals / 动物', color: '#45B7D1', description: 'Common animals' },
  { id: 'food', name: 'Food / 食物', color: '#FFA07A', description: 'Food items' },
  { id: 'family', name: 'Family / 家人', color: '#98D8C8', description: 'Family members' },
  { id: 'greetings', name: 'Greetings / 问候', color: '#DDA0DD', description: 'Common greetings' },
  { id: 'nature', name: 'Nature / 自然', color: '#90EE90', description: 'Nature words' },
  { id: 'actions', name: 'Actions / 动作', color: '#FFD700', description: 'Action verbs' },
];

const words = [
  // Numbers (easy)
  { id: 'n1', chinese: '一', pinyin: 'yi', english: 'one', category: 'numbers', difficulty: 'easy' },
  { id: 'n2', chinese: '二', pinyin: 'er', english: 'two', category: 'numbers', difficulty: 'easy' },
  { id: 'n3', chinese: '三', pinyin: 'san', english: 'three', category: 'numbers', difficulty: 'easy' },
  { id: 'n4', chinese: '四', pinyin: 'si', english: 'four', category: 'numbers', difficulty: 'easy' },
  { id: 'n5', chinese: '五', pinyin: 'wu', english: 'five', category: 'numbers', difficulty: 'easy' },
  { id: 'n6', chinese: '六', pinyin: 'liu', english: 'six', category: 'numbers', difficulty: 'easy' },
  { id: 'n7', chinese: '七', pinyin: 'qi', english: 'seven', category: 'numbers', difficulty: 'easy' },
  { id: 'n8', chinese: '八', pinyin: 'ba', english: 'eight', category: 'numbers', difficulty: 'easy' },
  { id: 'n9', chinese: '九', pinyin: 'jiu', english: 'nine', category: 'numbers', difficulty: 'easy' },
  { id: 'n10', chinese: '十', pinyin: 'shi', english: 'ten', category: 'numbers', difficulty: 'easy' },

  // Colors (easy)
  { id: 'c1', chinese: '红色', pinyin: 'hongse', english: 'red', category: 'colors', difficulty: 'easy' },
  { id: 'c2', chinese: '蓝色', pinyin: 'lanse', english: 'blue', category: 'colors', difficulty: 'easy' },
  { id: 'c3', chinese: '绿色', pinyin: 'lvse', english: 'green', category: 'colors', difficulty: 'easy' },
  { id: 'c4', chinese: '黄色', pinyin: 'huangse', english: 'yellow', category: 'colors', difficulty: 'easy' },
  { id: 'c5', chinese: '白色', pinyin: 'baise', english: 'white', category: 'colors', difficulty: 'easy' },
  { id: 'c6', chinese: '黑色', pinyin: 'heise', english: 'black', category: 'colors', difficulty: 'easy' },
  { id: 'c7', chinese: '橙色', pinyin: 'chengse', english: 'orange', category: 'colors', difficulty: 'medium' },
  { id: 'c8', chinese: '紫色', pinyin: 'zise', english: 'purple', category: 'colors', difficulty: 'medium' },

  // Animals (easy)
  { id: 'a1', chinese: '狗', pinyin: 'gou', english: 'dog', category: 'animals', difficulty: 'easy' },
  { id: 'a2', chinese: '猫', pinyin: 'mao', english: 'cat', category: 'animals', difficulty: 'easy' },
  { id: 'a3', chinese: '鸟', pinyin: 'niao', english: 'bird', category: 'animals', difficulty: 'easy' },
  { id: 'a4', chinese: '鱼', pinyin: 'yu', english: 'fish', category: 'animals', difficulty: 'easy' },
  { id: 'a5', chinese: '兔子', pinyin: 'tuzi', english: 'rabbit', category: 'animals', difficulty: 'easy' },
  { id: 'a6', chinese: '熊猫', pinyin: 'xiongmao', english: 'panda', category: 'animals', difficulty: 'easy' },
  { id: 'a7', chinese: '老虎', pinyin: 'laohu', english: 'tiger', category: 'animals', difficulty: 'easy' },
  { id: 'a8', chinese: '狮子', pinyin: 'shizi', english: 'lion', category: 'animals', difficulty: 'easy' },
  { id: 'a9', chinese: '大象', pinyin: 'daxiang', english: 'elephant', category: 'animals', difficulty: 'easy' },
  { id: 'a10', chinese: '猴子', pinyin: 'houzi', english: 'monkey', category: 'animals', difficulty: 'easy' },

  // Food (easy-medium)
  { id: 'f1', chinese: '米饭', pinyin: 'mifan', english: 'rice', category: 'food', difficulty: 'easy' },
  { id: 'f2', chinese: '面条', pinyin: 'miantiao', english: 'noodles', category: 'food', difficulty: 'easy' },
  { id: 'f3', chinese: '饺子', pinyin: 'jiaozi', english: 'dumpling', category: 'food', difficulty: 'easy' },
  { id: 'f4', chinese: '茶', pinyin: 'cha', english: 'tea', category: 'food', difficulty: 'easy' },
  { id: 'f5', chinese: '咖啡', pinyin: 'kafei', english: 'coffee', category: 'food', difficulty: 'easy' },
  { id: 'f6', chinese: '苹果', pinyin: 'pingguo', english: 'apple', category: 'food', difficulty: 'easy' },
  { id: 'f7', chinese: '香蕉', pinyin: 'xiangjiao', english: 'banana', category: 'food', difficulty: 'easy' },
  { id: 'f8', chinese: '橙子', pinyin: 'chengzi', english: 'orange (fruit)', category: 'food', difficulty: 'medium' },
  { id: 'f9', chinese: '包子', pinyin: 'baozi', english: 'steamed bun', category: 'food', difficulty: 'medium' },
  { id: 'f10', chinese: '豆浆', pinyin: 'doujiang', english: 'soy milk', category: 'food', difficulty: 'medium' },

  // Family (easy)
  { id: 'fm1', chinese: '爸爸', pinyin: 'baba', english: 'father', category: 'family', difficulty: 'easy' },
  { id: 'fm2', chinese: '妈妈', pinyin: 'mama', english: 'mother', category: 'family', difficulty: 'easy' },
  { id: 'fm3', chinese: '哥哥', pinyin: 'gege', english: 'older brother', category: 'family', difficulty: 'easy' },
  { id: 'fm4', chinese: '姐姐', pinyin: 'jiejie', english: 'older sister', category: 'family', difficulty: 'easy' },
  { id: 'fm5', chinese: '奶奶', pinyin: 'nainai', english: 'grandmother', category: 'family', difficulty: 'easy' },
  { id: 'fm6', chinese: '爷爷', pinyin: 'yeye', english: 'grandfather', category: 'family', difficulty: 'easy' },
  { id: 'fm7', chinese: '弟弟', pinyin: 'didi', english: 'younger brother', category: 'family', difficulty: 'easy' },
  { id: 'fm8', chinese: '妹妹', pinyin: 'meimei', english: 'younger sister', category: 'family', difficulty: 'easy' },

  // Greetings (easy-medium)
  { id: 'g1', chinese: '你好', pinyin: 'nihao', english: 'hello', category: 'greetings', difficulty: 'easy' },
  { id: 'g2', chinese: '再见', pinyin: 'zaijian', english: 'goodbye', category: 'greetings', difficulty: 'easy' },
  { id: 'g3', chinese: '谢谢', pinyin: 'xiexie', english: 'thank you', category: 'greetings', difficulty: 'easy' },
  { id: 'g4', chinese: '对不起', pinyin: 'duibuqi', english: 'sorry', category: 'greetings', difficulty: 'easy' },
  { id: 'g5', chinese: '没关系', pinyin: 'meiguanxi', english: "it's okay", category: 'greetings', difficulty: 'easy' },
  { id: 'g6', chinese: '早上好', pinyin: 'zaoshanghao', english: 'good morning', category: 'greetings', difficulty: 'medium' },
  { id: 'g7', chinese: '晚安', pinyin: 'wanan', english: 'good night', category: 'greetings', difficulty: 'medium' },
  { id: 'g8', chinese: '欢迎', pinyin: 'huanying', english: 'welcome', category: 'greetings', difficulty: 'medium' },

  // Nature (medium)
  { id: 'nat1', chinese: '山', pinyin: 'shan', english: 'mountain', category: 'nature', difficulty: 'easy' },
  { id: 'nat2', chinese: '水', pinyin: 'shui', english: 'water', category: 'nature', difficulty: 'easy' },
  { id: 'nat3', chinese: '火', pinyin: 'huo', english: 'fire', category: 'nature', difficulty: 'easy' },
  { id: 'nat4', chinese: '树', pinyin: 'shu', english: 'tree', category: 'nature', difficulty: 'easy' },
  { id: 'nat5', chinese: '花', pinyin: 'hua', english: 'flower', category: 'nature', difficulty: 'easy' },
  { id: 'nat6', chinese: '月亮', pinyin: 'yueliang', english: 'moon', category: 'nature', difficulty: 'medium' },
  { id: 'nat7', chinese: '太阳', pinyin: 'taiyang', english: 'sun', category: 'nature', difficulty: 'medium' },
  { id: 'nat8', chinese: '星星', pinyin: 'xingxing', english: 'star', category: 'nature', difficulty: 'medium' },
  { id: 'nat9', chinese: '云', pinyin: 'yun', english: 'cloud', category: 'nature', difficulty: 'medium' },
  { id: 'nat10', chinese: '雨', pinyin: 'yu', english: 'rain', category: 'nature', difficulty: 'medium' },

  // Actions (medium)
  { id: 'act1', chinese: '吃', pinyin: 'chi', english: 'to eat', category: 'actions', difficulty: 'easy' },
  { id: 'act2', chinese: '喝', pinyin: 'he', english: 'to drink', category: 'actions', difficulty: 'easy' },
  { id: 'act3', chinese: '看', pinyin: 'kan', english: 'to look', category: 'actions', difficulty: 'easy' },
  { id: 'act4', chinese: '听', pinyin: 'ting', english: 'to listen', category: 'actions', difficulty: 'easy' },
  { id: 'act5', chinese: '说', pinyin: 'shuo', english: 'to speak', category: 'actions', difficulty: 'easy' },
  { id: 'act6', chinese: '走', pinyin: 'zou', english: 'to walk', category: 'actions', difficulty: 'easy' },
  { id: 'act7', chinese: '跑', pinyin: 'pao', english: 'to run', category: 'actions', difficulty: 'easy' },
  { id: 'act8', chinese: '坐', pinyin: 'zuo', english: 'to sit', category: 'actions', difficulty: 'easy' },
  { id: 'act9', chinese: '站', pinyin: 'zhan', english: 'to stand', category: 'actions', difficulty: 'easy' },
  { id: 'act10', chinese: '睡觉', pinyin: 'shuijiao', english: 'to sleep', category: 'actions', difficulty: 'medium' },
];

export class BuiltInDictionary {
  get id() { return 'builtin'; }
  get name() { return 'Built-in Dictionary'; }

  getCategories() {
    return categories;
  }

  getWords(categoryIds) {
    if (!categoryIds || categoryIds.length === 0) {
      return [...words];
    }
    return words.filter(w => categoryIds.includes(w.category));
  }

  getWordsByDifficulty(difficulty) {
    return words.filter(w => w.difficulty === difficulty);
  }

  getRandomWords(count, categoryIds) {
    const filtered = this.getWords(categoryIds);
    const shuffled = [...filtered].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(count, filtered.length));
  }

  search(query) {
    const q = normalizePinyin(query).toLowerCase();
    return words.filter(w => 
      normalizePinyin(w.pinyin).includes(q) ||
      w.chinese.includes(query) ||
      (w.english && w.english.toLowerCase().includes(q))
    );
  }

  getWordCount() {
    return words.length;
  }
}

// Export singleton instance
export const builtInDictionary = new BuiltInDictionary();

// Export data for direct access if needed
export { categories, words };
