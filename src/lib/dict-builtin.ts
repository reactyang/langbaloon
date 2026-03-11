import { DictionaryProvider, DictCategory, DictWord } from '../types';

export const categories: DictCategory[] = [
  { id: 'greetings', name: '问候', color: '#ff6b6b', description: 'Greetings expressions' },
  { id: 'numbers', name: '数字', color: '#ffd93d', description: 'Numbers 1-10' },
  { id: 'colors', name: '颜色', color: '#6bcb77', description: 'Basic colors' },
  { id: 'family', name: '家庭', color: '#4ecdc4', description: 'Family members' },
  { id: 'animals', name: '动物', color: '#9b59b6', description: 'Common animals' },
  { id: 'food', name: '食物', color: '#ff8c00', description: 'Food items' },
  { id: 'time', name: '时间', color: '#3498db', description: 'Time-related words' },
  { id: 'nature', name: '自然', color: '#2ecc71', description: 'Nature elements' },
];

const words: DictWord[] = [
  // Greetings (easy)
  { id: '1', chinese: '你好', pinyin: 'nihao', english: 'hello', category: 'greetings', difficulty: 'easy' },
  { id: '2', chinese: '早上好', pinyin: 'zaoshanghao', english: 'good morning', category: 'greetings', difficulty: 'easy' },
  { id: '3', chinese: '晚安', pinyin: 'wanan', english: 'good night', category: 'greetings', difficulty: 'easy' },
  { id: '4', chinese: '再见', pinyin: 'zaijian', english: 'goodbye', category: 'greetings', difficulty: 'easy' },
  { id: '5', chinese: '谢谢', pinyin: 'xiexie', english: 'thank you', category: 'greetings', difficulty: 'easy' },
  { id: '6', chinese: '不客气', pinyin: 'bu keqi', english: "you're welcome", category: 'greetings', difficulty: 'easy' },
  { id: '7', chinese: '对不起', pinyin: 'duibuqi', english: 'sorry', category: 'greetings', difficulty: 'easy' },
  { id: '8', chinese: '没关系', pinyin: 'meiguanxi', english: "it's okay", category: 'greetings', difficulty: 'easy' },
  { id: '9', chinese: '你好吗', pinyin: 'nima', english: 'how are you', category: 'greetings', difficulty: 'easy' },
  { id: '10', chinese: '我很好', pinyin: 'wo henhao', english: 'I am fine', category: 'greetings', difficulty: 'easy' },

  // Numbers (easy)
  { id: '11', chinese: '一', pinyin: 'yi', english: 'one', category: 'numbers', difficulty: 'easy' },
  { id: '12', chinese: '二', pinyin: 'er', english: 'two', category: 'numbers', difficulty: 'easy' },
  { id: '13', chinese: '三', pinyin: 'san', english: 'three', category: 'numbers', difficulty: 'easy' },
  { id: '14', chinese: '四', pinyin: 'si', english: 'four', category: 'numbers', difficulty: 'easy' },
  { id: '15', chinese: '五', pinyin: 'wu', english: 'five', category: 'numbers', difficulty: 'easy' },
  { id: '16', chinese: '六', pinyin: 'liu', english: 'six', category: 'numbers', difficulty: 'easy' },
  { id: '17', chinese: '七', pinyin: 'qi', english: 'seven', category: 'numbers', difficulty: 'easy' },
  { id: '18', chinese: '八', pinyin: 'ba', english: 'eight', category: 'numbers', difficulty: 'easy' },
  { id: '19', chinese: '九', pinyin: 'jiu', english: 'nine', category: 'numbers', difficulty: 'easy' },
  { id: '20', chinese: '十', pinyin: 'shi', english: 'ten', category: 'numbers', difficulty: 'easy' },

  // Colors (easy)
  { id: '21', chinese: '红色', pinyin: 'hongse', english: 'red', category: 'colors', difficulty: 'easy' },
  { id: '22', chinese: '蓝色', pinyin: 'lanse', english: 'blue', category: 'colors', difficulty: 'easy' },
  { id: '23', chinese: '绿色', pinyin: 'lvse', english: 'green', category: 'colors', difficulty: 'easy' },
  { id: '24', chinese: '黄色', pinyin: 'huangse', english: 'yellow', category: 'colors', difficulty: 'easy' },
  { id: '25', chinese: '白色', pinyin: 'baise', english: 'white', category: 'colors', difficulty: 'easy' },
  { id: '26', chinese: '黑色', pinyin: 'heise', english: 'black', category: 'colors', difficulty: 'easy' },
  { id: '27', chinese: '橙色', pinyin: 'chengse', english: 'orange', category: 'colors', difficulty: 'medium' },
  { id: '28', chinese: '紫色', pinyin: 'zise', english: 'purple', category: 'colors', difficulty: 'medium' },
  { id: '29', chinese: '粉色', pinyin: 'fense', english: 'pink', category: 'colors', difficulty: 'medium' },
  { id: '30', chinese: '棕色', pinyin: 'zongse', english: 'brown', category: 'colors', difficulty: 'medium' },

  // Family (easy)
  { id: '31', chinese: '妈妈', pinyin: 'mama', english: 'mom', category: 'family', difficulty: 'easy' },
  { id: '32', chinese: '爸爸', pinyin: 'baba', english: 'dad', category: 'family', difficulty: 'easy' },
  { id: '33', chinese: '爷爷', pinyin: 'yeye', english: 'grandfather (paternal)', category: 'family', difficulty: 'easy' },
  { id: '34', chinese: '奶奶', pinyin: 'nainai', english: 'grandmother (paternal)', category: 'family', difficulty: 'easy' },
  { id: '35', chinese: '哥哥', pinyin: 'gege', english: 'older brother', category: 'family', difficulty: 'easy' },
  { id: '36', chinese: '姐姐', pinyin: 'jiejie', english: 'older sister', category: 'family', difficulty: 'easy' },
  { id: '37', chinese: '弟弟', pinyin: 'didi', english: 'younger brother', category: 'family', difficulty: 'easy' },
  { id: '38', chinese: '妹妹', pinyin: 'meimei', english: 'younger sister', category: 'family', difficulty: 'easy' },
  { id: '39', chinese: '朋友', pinyin: 'pengyou', english: 'friend', category: 'family', difficulty: 'easy' },
  { id: '40', chinese: '老师', pinyin: 'laoshi', english: 'teacher', category: 'family', difficulty: 'easy' },

  // Animals (easy)
  { id: '41', chinese: '狗', pinyin: 'gou', english: 'dog', category: 'animals', difficulty: 'easy' },
  { id: '42', chinese: '猫', pinyin: 'mao', english: 'cat', category: 'animals', difficulty: 'easy' },
  { id: '43', chinese: '鸟', pinyin: 'niao', english: 'bird', category: 'animals', difficulty: 'easy' },
  { id: '44', chinese: '鱼', pinyin: 'yu', english: 'fish', category: 'animals', difficulty: 'easy' },
  { id: '45', chinese: '兔子', pinyin: 'tuzi', english: 'rabbit', category: 'animals', difficulty: 'easy' },
  { id: '46', chinese: '马', pinyin: 'ma', english: 'horse', category: 'animals', difficulty: 'easy' },
  { id: '47', chinese: '牛', pinyin: 'niu', english: 'cow', category: 'animals', difficulty: 'easy' },
  { id: '48', chinese: '猪', pinyin: 'zhu', english: 'pig', category: 'animals', difficulty: 'easy' },
  { id: '49', chinese: '熊', pinyin: 'xiong', english: 'bear', category: 'animals', difficulty: 'medium' },
  { id: '50', chinese: '熊猫', pinyin: 'xiongmao', english: 'panda', category: 'animals', difficulty: 'easy' },
  { id: '51', chinese: '老虎', pinyin: 'laohu', english: 'tiger', category: 'animals', difficulty: 'medium' },
  { id: '52', chinese: '大象', pinyin: 'daxiang', english: 'elephant', category: 'animals', difficulty: 'medium' },

  // Food (easy)
  { id: '53', chinese: '米饭', pinyin: 'mifan', english: 'rice', category: 'food', difficulty: 'easy' },
  { id: '54', chinese: '面包', pinyin: 'mianbao', english: 'bread', category: 'food', difficulty: 'easy' },
  { id: '55', chinese: '牛奶', pinyin: 'niunai', english: 'milk', category: 'food', difficulty: 'easy' },
  { id: '56', chinese: '水', pinyin: 'shui', english: 'water', category: 'food', difficulty: 'easy' },
  { id: '57', chinese: '茶', pinyin: 'cha', english: 'tea', category: 'food', difficulty: 'easy' },
  { id: '58', chinese: '苹果', pinyin: 'pingguo', english: 'apple', category: 'food', difficulty: 'easy' },
  { id: '59', chinese: '香蕉', pinyin: 'xiangjiao', english: 'banana', category: 'food', difficulty: 'easy' },
  { id: '60', chinese: '橙子', pinyin: 'chengzi', english: 'orange (fruit)', category: 'food', difficulty: 'medium' },
  { id: '61', chinese: '蛋糕', pinyin: 'dangao', english: 'cake', category: 'food', difficulty: 'easy' },
  { id: '62', chinese: '饺子', pinyin: 'jiaozi', english: 'dumpling', category: 'food', difficulty: 'medium' },

  // Time (medium)
  { id: '63', chinese: '今天', pinyin: 'jin tian', english: 'today', category: 'time', difficulty: 'easy' },
  { id: '64', chinese: '明天', pinyin: 'mingtian', english: 'tomorrow', category: 'time', difficulty: 'easy' },
  { id: '65', chinese: '昨天', pinyin: 'zuotian', english: 'yesterday', category: 'time', difficulty: 'easy' },
  { id: '66', chinese: '现在', pinyin: 'xianzai', english: 'now', category: 'time', difficulty: 'easy' },
  { id: '67', chinese: '时候', pinyin: 'shihou', english: 'time (when)', category: 'time', difficulty: 'medium' },
  { id: '68', chinese: '早上', pinyin: 'zaoshang', english: 'morning', category: 'time', difficulty: 'easy' },
  { id: '69', chinese: '中午', pinyin: 'zhongwu', english: 'noon', category: 'time', difficulty: 'medium' },
  { id: '70', chinese: '晚上', pinyin: 'wanshang', english: 'evening', category: 'time', difficulty: 'easy' },
  { id: '71', chinese: '星期', pinyin: 'xingqi', english: 'week', category: 'time', difficulty: 'medium' },
  { id: '72', chinese: '月', pinyin: 'yue', english: 'month', category: 'time', difficulty: 'medium' },

  // Nature (easy)
  { id: '73', chinese: '山', pinyin: 'shan', english: 'mountain', category: 'nature', difficulty: 'easy' },
  { id: '74', chinese: '水', pinyin: 'shui', english: 'water', category: 'nature', difficulty: 'easy' },
  { id: '75', chinese: '火', pinyin: 'huo', english: 'fire', category: 'nature', difficulty: 'easy' },
  { id: '76', chinese: '风', pinyin: 'feng', english: 'wind', category: 'nature', difficulty: 'easy' },
  { id: '77', chinese: '雨', pinyin: 'yu', english: 'rain', category: 'nature', difficulty: 'easy' },
  { id: '78', chinese: '雪', pinyin: 'xue', english: 'snow', category: 'nature', difficulty: 'easy' },
  { id: '79', chinese: '花', pinyin: 'hua', english: 'flower', category: 'nature', difficulty: 'easy' },
  { id: '80', chinese: '树', pinyin: 'shu', english: 'tree', category: 'nature', difficulty: 'easy' },
  { id: '81', chinese: '草', pinyin: 'cao', english: 'grass', category: 'nature', difficulty: 'easy' },
  { id: '82', chinese: '太阳', pinyin: 'taiyang', english: 'sun', category: 'nature', difficulty: 'easy' },
  { id: '83', chinese: '月亮', pinyin: 'yueliang', english: 'moon', category: 'nature', difficulty: 'easy' },
  { id: '84', chinese: '星星', pinyin: 'xingxing', english: 'star', category: 'nature', difficulty: 'easy' },
  { id: '85', chinese: '天空', pinyin: 'tiankong', english: 'sky', category: 'nature', difficulty: 'medium' },
  { id: '86', chinese: '云', pinyin: 'yun', english: 'cloud', category: 'nature', difficulty: 'easy' },
];

export const builtInDictionary: DictionaryProvider = {
  id: 'builtin',
  name: 'Built-in Dictionary',
  
  getCategories: () => categories,
  
  getWords: (categoryIds?: string[]): DictWord[] => {
    if (!categoryIds || categoryIds.length === 0) {
      return words;
    }
    return words.filter(w => w.category && categoryIds.includes(w.category));
  },
  
  getWordsByDifficulty: (difficulty: string): DictWord[] => {
    return words.filter(w => w.difficulty === difficulty);
  },
  
  getRandomWords: (count: number, categoryIds?: string[]): DictWord[] => {
    let pool = words;
    if (categoryIds && categoryIds.length > 0) {
      pool = words.filter(w => w.category && categoryIds.includes(w.category));
    }
    
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(count, shuffled.length));
  },
  
  search: (query: string): DictWord[] => {
    const q = query.toLowerCase();
    return words.filter(w => 
      w.chinese.includes(q) || 
      w.pinyin.toLowerCase().includes(q) ||
      w.english?.toLowerCase().includes(q)
    );
  },
  
  getWordCount: () => words.length,
};