/**
 * BitapSearcher class adapted from Fuse project.
 * https://github.com/krisk/Fuse
 */

/**
 * @license
 * Fuse - Lightweight fuzzy-search
 *
 * Copyright (c) 2012 Kirollos Risk <kirollos@gmail.com>.
 * All Rights Reserved. Apache Software License 2.0
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
(function(global) {

  var BitapSearcher = function(pattern, options) {
    options = options || {};
    this.options = options;
    this.options.location = options.location || BitapSearcher.defaultOptions.location;
    this.options.distance = 'distance' in options ? options.distance : BitapSearcher.defaultOptions.distance;
    this.options.threshold = 'threshold' in options ? options.threshold : BitapSearcher.defaultOptions.threshold;
    this.options.maxPatternLength = options.maxPatternLength || BitapSearcher.defaultOptions.maxPatternLength;

    this.pattern = options.caseSensitive ? pattern : pattern.toLowerCase();
    this.patternLen = pattern.length;

    if (this.patternLen > this.options.maxPatternLength) {
      throw new Error('Pattern length is too long');
    }

    this.matchmask = 1 << (this.patternLen - 1);
    this.patternAlphabet = this._calculatePatternAlphabet();
  };

  BitapSearcher.defaultOptions = {
    // Approximately where in the text is the pattern expected to be found?
    location: 0,

    // Determines how close the match must be to the fuzzy location (specified above).
    // An exact letter match which is 'distance' characters away from the fuzzy location
    // would score as a complete mismatch. A distance of '0' requires the match be at
    // the exact location specified, a threshold of '1000' would require a perfect match
    // to be within 800 characters of the fuzzy location to be found using a 0.8 threshold.
    distance: 100,

    // At what point does the match algorithm give up. A threshold of '0.0' requires a perfect match
    // (of both letters and location), a threshold of '1.0' would match anything.
    threshold: 0.6,

    // Machine word size
    maxPatternLength: 32
  };

  /**
   * Initialize the alphabet for the Bitap algorithm.
   * @return {Object} Hash of character locations.
   * @private
   */
  BitapSearcher.prototype._calculatePatternAlphabet = function() {
    var mask = {},
        i = 0;

    for (i = 0; i < this.patternLen; i++) {
      mask[this.pattern.charAt(i)] = 0;
    }

    for (i = 0; i < this.patternLen; i++) {
      mask[this.pattern.charAt(i)] |= 1 << (this.pattern.length - i - 1);
    }

    return mask;
  };

  /**
   * Compute and return the score for a match with `e` errors and `x` location.
   * @param {number} errors Number of errors in match.
   * @param {number} location Location of match.
   * @return {number} Overall score for match (0.0 = good, 1.0 = bad).
   * @private
   */
  BitapSearcher.prototype._bitapScore = function(errors, location) {
    var accuracy = errors / this.patternLen,
        proximity = Math.abs(this.options.location - location);

    if (!this.options.distance) {
      // Dodge divide by zero error.
      return proximity ? 1.0 : accuracy;
    }
    return accuracy + (proximity / this.options.distance);
  };

  /**
   * Compute and return the result of the search
   * @param {String} text The text to search in
   * @return {Object} Literal containing:
   *                          {Boolean} isMatch Whether the text is a match or not
   *                          {Decimal} score Overall score for the match
   * @public
   */
  BitapSearcher.prototype.search = function(text) {
    text = this.options.caseSensitive ? text : text.toLowerCase();

    if (this.pattern === text) {
      // Exact match
      return {
        isMatch: true,
        score: 0
      };
    }

    var i, j,
    // Set starting location at beginning text and initialize the alphabet.
        textLen = text.length,
        LOCATION = this.options.location,
    // Highest score beyond which we give up.
        THRESHOLD = this.options.threshold,
    // Is there a nearby exact match? (speedup)
        bestLoc = text.indexOf(this.pattern, LOCATION),
        binMin, binMid,
        binMax = this.patternLen + textLen,
        start, finish,
        bitArr, lastBitArr,
        charMatch,
        score = 1,
        locations = [];

    if (bestLoc != -1) {
      THRESHOLD = Math.min(this._bitapScore(0, bestLoc), THRESHOLD);
      // What about in the other direction? (speedup)
      bestLoc = text.lastIndexOf(this.pattern, LOCATION + this.patternLen);

      if (bestLoc != -1) {
        THRESHOLD = Math.min(this._bitapScore(0, bestLoc), THRESHOLD);
      }
    }

    bestLoc = -1;

    for (i = 0; i < this.patternLen; i++) {
      // Scan for the best match; each iteration allows for one more error.
      // Run a binary search to determine how far from 'MATCH_LOCATION' we can stray at this
      // error level.
      binMin = 0;
      binMid = binMax;
      while (binMin < binMid) {
        if (this._bitapScore(i, LOCATION + binMid) <= THRESHOLD) {
          binMin = binMid;
        } else {
          binMax = binMid;
        }
        binMid = Math.floor((binMax - binMin) / 2 + binMin);
      }

      // Use the result from this iteration as the maximum for the next.
      binMax = binMid;
      start = Math.max(1, LOCATION - binMid + 1);
      finish = Math.min(LOCATION + binMid, textLen) + this.patternLen;

      // Initialize the bit array
      bitArr = Array(finish + 2);

      bitArr[finish + 1] = (1 << i) - 1;

      for (j = finish; j >= start; j--) {
        // The alphabet <patternAlphabet> is a sparse hash, so the following line generates warnings.
        charMatch = this.patternAlphabet[text.charAt(j - 1)];

        if (i === 0) {
          // First pass: exact match.
          bitArr[j] = ((bitArr[j + 1] << 1) | 1) & charMatch;
        } else {
          // Subsequent passes: fuzzy match.
          bitArr[j] = ((bitArr[j + 1] << 1) | 1) & charMatch | (((lastBitArr[j + 1] | lastBitArr[j]) << 1) | 1) | lastBitArr[j + 1];
        }
        if (bitArr[j] & this.matchmask) {
          score = this._bitapScore(i, j - 1);
          // This match will almost certainly be better than any existing match.
          // But check anyway.
          if (score <= THRESHOLD) {
            // Told you so.
            THRESHOLD = score;
            bestLoc = j - 1;
            locations.push(bestLoc);

            if (bestLoc > LOCATION) {
              // When passing loc, don't exceed our current distance from loc.
              start = Math.max(1, 2 * LOCATION - bestLoc);
            } else {
              // Already passed loc, downhill from here on in.
              break;
            }
          }
        }
      }

      // No hope for a (better) match at greater error levels.
      if (this._bitapScore(i + 1, LOCATION) > THRESHOLD) {
        break;
      }
      lastBitArr = bitArr;
    }

    return {
      isMatch: bestLoc >= 0,
      score: score
    };
  };

  global.BitapSearcher = BitapSearcher;

})(this);