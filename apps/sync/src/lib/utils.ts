/**
 * https://github.com/aceakash/string-similarity/blob/master/src/index.js
 * Compares two strings and returns a similarity score between 0 and 1.
 * @param string1 - The first string to compare.
 * @param string2 - The second string to compare.
 * @returns A number between 0 and 1 representing the similarity score.
 */
export function compareTwoStrings(string1: string, string2: string) {
  const first = string1.replace(/\s+/g, "");
  const second = string2.replace(/\s+/g, "");

  if (first === second) return 1; // identical or empty
  if (first.length < 2 || second.length < 2) return 0; // if either is a 0-letter or 1-letter string

  const firstBigrams = new Map();
  for (let i = 0; i < first.length - 1; i++) {
    const bigram = first.substring(i, i + 2);
    const count = firstBigrams.has(bigram) ? firstBigrams.get(bigram) + 1 : 1;

    firstBigrams.set(bigram, count);
  }

  let intersectionSize = 0;
  for (let i = 0; i < second.length - 1; i++) {
    const bigram = second.substring(i, i + 2);
    const count = firstBigrams.has(bigram) ? firstBigrams.get(bigram) : 0;

    if (count > 0) {
      firstBigrams.set(bigram, count - 1);
      intersectionSize++;
    }
  }

  return (2.0 * intersectionSize) / (first.length + second.length - 2);
}
