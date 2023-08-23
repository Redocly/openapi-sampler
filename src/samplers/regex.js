const RandExp = require('../vendor/randexp');

const RANDOM_SEARCH_MAX_ITERS = 250;

/**
 * Generates a string that matches a given regex pattern and,
 * if possible, falls within the given length constraints.
 *
 * For some advanced regexes we may fail to meet the length constraints exactly.
 * (e.g. knapsacks or chicken mcnugget problems)
 *
 * @param {string} pattern
 * @param {number} minLength
 * @param {number} maxLength
 * @return {string}
 */
export function sampleRegex(pattern, minLength = 0, maxLength = Infinity) {
  const randexp = new RandExp(pattern);

  RandExp.prototype.randIntRepetition = (from) => from;
  const initialSample = randexp.gen();
  if (initialSample.length >= minLength && initialSample <= maxLength) {
    return initialSample;
  }

  // Add on average this many characters to each repetition
  let seed = 1;
  // Adjust the seed by this much when result is too low or too high.
  let learningRate = 2;

  RandExp.prototype.randIntRepetition = (from, to) => {
    const roll = seed * Math.random() * 2;
    const remainder = roll % 1;
    const intRoll = Math.floor(roll) + (Math.random() < remainder ? 1 : 0);
    return from + (intRoll % (to - from + 1));
  };

  let distance = Infinity; // how much the best generation is too low or high by
  let best;
  for (let i = 0; i < RANDOM_SEARCH_MAX_ITERS; i++) {
    const sample = randexp.gen();

    if (sample.length < minLength) {
      seed *= learningRate;
      if (minLength - sample.length < distance) {
        distance = minLength - sample.length;
        best = sample;
      }
    } else if (sample.length > maxLength) {
      seed /= learningRate;
      if (sample.length - maxLength < distance) {
        distance = sample.length - maxLength;
        best = sample;
      }
    } else {
      return sample;
    }

    learningRate -= 1 / RANDOM_SEARCH_MAX_ITERS;
  }

  return best;
}
