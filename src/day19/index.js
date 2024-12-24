function parseTowelPatterns(patternLine) {
  return patternLine.split(', ');
}

function parseDesigns(designList) {
  return designList.split('\n').filter((design) => design.length > 0);
}

function testDesign(patternSet, design, cache) {
  if (design.length === 0) return true;
  if (cache.has(design)) return cache.get(design);

  for (let i = 1; i <= design.length; i++) {
    // If the start of the design matches, recursively test the rest of it
    if (
      patternSet.has(design.slice(0, i)) &&
      testDesign(patternSet, design.slice(i), cache)
    ) {
      cache.set(design, true);
      return true;
    }
  }

  cache.set(design, false);
  return false;
}

function countPossibleDesigns(patterns, designs) {
  const patternSet = new Set(patterns);

  const cache = new Map();
  return designs.reduce((count, design) => {
    if (testDesign(patternSet, design, cache)) return count + 1;
    return count;
  }, 0);
}

export default function run(input) {
  const [patternLine, designList] = input.split('\n\n');
  const patterns = parseTowelPatterns(patternLine);
  const designs = parseDesigns(designList);

  return countPossibleDesigns(patterns, designs);
}
