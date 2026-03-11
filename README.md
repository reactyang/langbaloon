# Chinese Vocabulary Balloon Shooter Game

A fun language learning game where players type pinyin to pop floating Chinese word balloons.

## Setup

```bash
cd ~/workspace/langballoon
npm install
```

## Run

Open `index.html` in Chrome, or:

```bash
npx serve .
```

Then open http://localhost:3000 in your browser.

## Test

```bash
npm test
```

## Features

- 🎈 Balloons float up with Chinese vocabulary words
- ⌨️ Type the pinyin and press Enter to pop matching balloons
- 🔊 Celebration sound on correct match, wrong sound on incorrect
- 🏆 Win when all balloons are cleared
- 📝 Choose word categories to play
- 🎲 Or use random word selection (pick X number of words)
- ⚙️ Configurable balloon count and lives

## Adding New Dictionary Providers

The game uses a dictionary abstraction layer. To add a new dictionary:

### 1. Create a new provider file

Create `src/dict-YOURNAME.ts` implementing the `DictionaryProvider` interface:

```typescript
import { 
  DictionaryProvider, 
  DictWord, 
  DictCategory 
} from './dict-provider.js';

export class YourDictionaryProvider implements DictionaryProvider {
  readonly id = 'your-dict';
  readonly name = 'Your Dictionary';

  getCategories(): DictCategory[] {
    // Return categories
  }

  getWords(categoryIds?: string[]): DictWord[] {
    // Return words, optionally filtered by category
  }

  getWordsByDifficulty(difficulty: 'easy' | 'medium' | 'hard'): DictWord[] {
    // Return words by difficulty
  }

  getRandomWords(count: number, categoryIds?: string[]): DictWord[] {
    // Return random selection of words
  }

  search(query: string): DictWord[] {
    // Search words
  }

  getWordCount(): number {
    // Return total word count
  }
}
```

### 2. Register in dict-factory.ts

```typescript
import { YourDictionaryProvider } from './dict-YOURNAME.js';

// In initializeDictionaries():
registerDictionary(new YourDictionaryProvider());
```

### 3. Use it in the UI

The UI already supports switching dictionaries via the factory. Users can select from available dictionaries.

## Dictionary Provider Interface

See `src/dict-provider.ts` for the full interface:

- `DictWord`: { id, chinese, pinyin, english?, category?, difficulty? }
- `DictCategory`: { id, name, color, description? }
- `DictionaryProvider`: Abstract interface for dictionary sources

## Built-in Dictionary

The default `BuiltInDictionary` contains ~70 words across 8 categories:
- Numbers (数字)
- Colors (颜色)
- Animals (动物)
- Food (食物)
- Family (家人)
- Greetings (问候)
- Nature (自然)
- Actions (动作)

Each word has difficulty level (easy/medium/hard).

## Project Structure

```
langballoon/
├── index.html           # Main game UI
├── src/
│   ├── dict-provider.ts    # Dictionary interface/types
│   ├── dict-factory.ts     # Dictionary registry/factory
│   ├── dict-builtin.ts     # Built-in dictionary
│   ├── dict-ccedict.ts    # CC-CEDICT placeholder (example)
│   ├── game.ts             # Game logic
│   ├── audio.ts           # Sound effects
│   └── game.test.ts       # Tests
└── package.json
```
