/**
 * Join array objects with the same start and ending position
 * @Organization Intelequia
 * @Author Pablo Suarez Romero
 * @param {Array} array - Array of objects with start, end, and text properties
 * @returns {Array} Array of objects with combined texts for the same start and end points
 */
  const getUniqueItems = (arr) => {
    const seen = {};
    
    arr.forEach(item => {
        const startEndPair = `${item.start}_${item.end}`;
        
        if (!seen[startEndPair]) {
            seen[startEndPair] = {
                start: item.start,
                end: item.end,
                text: [item.text]
            };
        } else {
            seen[startEndPair].text.push(item.text);
        }
    });

    return Object.values(seen);
};


module.exports = {getUniqueItems};
