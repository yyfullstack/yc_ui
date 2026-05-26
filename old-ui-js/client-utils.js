/**
 * @file 客户端工具函数模块
 * @description 提供字符串处理、日期格式化、数字格式化、DOM操作等工具函数
 * @author YC-UI Team
 * @version 3.0.1
 * @since 2024-01-01
 * @copyright YC-UI Components
 */
(function ($e) {
    'use strict';

    var toString = Object.prototype.toString;
    var TYPES = {
        Array: '[object Array]',
        Number: '[object Number]',
        String: '[object String]',
        Function: '[object Function]',
        Object: '[object Object]',
        Date: '[object Date]',
        RegExp: '[object RegExp]',
        Boolean: '[object Boolean]'
    };

    function getType(obj) {
        return toString.call(obj);
    }

    /**
     * 工具函数命名空间
     * @namespace
     */
    $e.fn = {
        isIE: function () {
            return !!(window.ActiveXObject || 'ActiveXObject' in window);
        },

        isArray: function (obj) {
            return getType(obj) === TYPES.Array;
        },

        isNumber: function (obj) {
            return getType(obj) === TYPES.Number;
        },

        isString: function (obj) {
            return getType(obj) === TYPES.String;
        },

        isFunction: function (obj) {
            return getType(obj) === TYPES.Function;
        },

        isObject: function (obj) {
            return getType(obj) === TYPES.Object;
        },

        isDate: function (obj) {
            return getType(obj) === TYPES.Date;
        },

        isRegExp: function (obj) {
            return getType(obj) === TYPES.RegExp;
        },

        isBoolean: function (obj) {
            return getType(obj) === TYPES.Boolean;
        },

        /**
         * 判断是否为undefined
         * @public
         * @param {*} obj - 要判断的对象
         * @returns {boolean} 是否为undefined
         */
        isUndefined: function (obj) {
            return obj === undefined;
        },

        /**
         * 判断是否为null
         * @public
         * @param {*} obj - 要判断的对象
         * @returns {boolean} 是否为null
         */
        isNull: function (obj) {
            return obj === null;
        },

        /**
         * 判断是否为空对象
         * @public
         * @param {Object} obj - 要判断的对象
         * @returns {boolean} 是否为空对象
         */
        isEmptyObject: function (obj) {
            for (var key in obj) {
                if (obj.hasOwnProperty(key)) {
                    return false;
                }
            }
            return true;
        },

        /**
         * 判断是否为空字符串
         * @public
         * @param {string} str - 要判断的字符串
         * @returns {boolean} 是否为空字符串
         */
        isEmptyString: function (str) {
            return str === '' || str === null || str === undefined;
        },

        /**
         * 判断是否为纯对象
         * @public
         * @param {*} obj - 要判断的对象
         * @returns {boolean} 是否为纯对象
         */
        isPlainObject: function (obj) {
            if (!obj || getType(obj) !== TYPES.Object) {
                return false;
            }
            var proto = Object.getPrototypeOf(obj);
            if (!proto) {
                return true;
            }
            var Ctor = proto.hasOwnProperty('constructor') && proto.constructor;
            return typeof Ctor === 'function' && Ctor.toString() === Object.prototype.toString.call(Ctor);
        },

        /**
         * 判断是否为Window对象
         * @public
         * @param {*} obj - 要判断的对象
         * @returns {boolean} 是否为Window对象
         */
        isWindow: function (obj) {
            return obj != null && obj === obj.window;
        },

        /**
         * 判断是否为类数组对象
         * @public
         * @param {*} obj - 要判断的对象
         * @returns {boolean} 是否为类数组对象
         */
        isArrayLike: function (obj) {
            var length = !!obj && 'length' in obj && obj.length;
            var type = getType(obj);
            if (type === TYPES.Function || this.isWindow(obj)) {
                return false;
            }
            return type === TYPES.Array || length === 0 ||
                (typeof length === 'number' && length > 0 && (length - 1) in obj);
        },

        /**
         * 判断是否为NaN
         * @public
         * @param {*} obj - 要判断的对象
         * @returns {boolean} 是否为NaN
         */
        isNaN: function (obj) {
            return obj !== obj;
        },

        /**
         * 判断是否为Finite
         * @public
         * @param {*} obj - 要判断的对象
         * @returns {boolean} 是否为Finite
         */
        isFinite: function (obj) {
            return isFinite(obj) && !isNaN(parseFloat(obj));
        },

        /**
         * 判断是否为整数
         * @public
         * @param {*} obj - 要判断的对象
         * @returns {boolean} 是否为整数
         */
        isInteger: function (obj) {
            return typeof obj === 'number' && isFinite(obj) && Math.floor(obj) === obj;
        },

        /**
         * 判断是否为安全整数
         * @public
         * @param {*} obj - 要判断的对象
         * @returns {boolean} 是否为安全整数
         */
        isSafeInteger: function (obj) {
            return this.isInteger(obj) && Math.abs(obj) <= Number.MAX_SAFE_INTEGER;
        },

        /**
         * 判断是否为负数零
         * @public
         * @param {*} obj - 要判断的对象
         * @returns {boolean} 是否为负数零
         */
        isNegativeZero: function (obj) {
            return obj === 0 && (1 / obj) === -Infinity;
        },

        /**
         * 判断是否为正数零
         * @public
         * @param {*} obj - 要判断的对象
         * @returns {boolean} 是否为正数零
         */
        isPositiveZero: function (obj) {
            return obj === 0 && (1 / obj) === Infinity;
        },

        /**
         * 判断是否为非负数
         * @public
         * @param {*} obj - 要判断的对象
         * @returns {boolean} 是否为非负数
         */
        isNonNegative: function (obj) {
            return typeof obj === 'number' && obj >= 0;
        },

        /**
         * 判断是否为非正数
         * @public
         * @param {*} obj - 要判断的对象
         * @returns {boolean} 是否为非正数
         */
        isNonPositive: function (obj) {
            return typeof obj === 'number' && obj <= 0;
        },

        /**
         * 判断是否为奇数
         * @public
         * @param {number} num - 要判断的数字
         * @returns {boolean} 是否为奇数
         */
        isOdd: function (num) {
            return this.isInteger(num) && (num % 2 !== 0);
        },

        /**
         * 判断是否为偶数
         * @public
         * @param {number} num - 要判断的数字
         * @returns {boolean} 是否为偶数
         */
        isEven: function (num) {
            return this.isInteger(num) && (num % 2 === 0);
        },

        /**
         * 判断是否为质数
         * @public
         * @param {number} num - 要判断的数字
         * @returns {boolean} 是否为质数
         */
        isPrime: function (num) {
            if (!this.isInteger(num) || num < 2) {
                return false;
            }
            for (var i = 2; i <= Math.sqrt(num); i++) {
                if (num % i === 0) {
                    return false;
                }
            }
            return true;
        },

        /**
         * 判断是否为合数
         * @public
         * @param {number} num - 要判断的数字
         * @returns {boolean} 是否为合数
         */
        isComposite: function (num) {
            return this.isInteger(num) && num > 1 && !this.isPrime(num);
        },

        /**
         * 判断是否为完全平方数
         * @public
         * @param {number} num - 要判断的数字
         * @returns {boolean} 是否为完全平方数
         */
        isPerfectSquare: function (num) {
            return this.isInteger(num) && num >= 0 && Math.sqrt(num) % 1 === 0;
        },

        /**
         * 判断是否为完全立方数
         * @public
         * @param {number} num - 要判断的数字
         * @returns {boolean} 是否为完全立方数
         */
        isPerfectCube: function (num) {
            return this.isInteger(num) && Math.cbrt(num) % 1 === 0;
        },

        /**
         * 判断是否为斐波那契数
         * @public
         * @param {number} num - 要判断的数字
         * @returns {boolean} 是否为斐波那契数
         */
        isFibonacci: function (num) {
            if (!this.isInteger(num) || num < 0) {
                return false;
            }
            var a = 5 * num * num + 4;
            var b = 5 * num * num - 4;
            return this.isPerfectSquare(a) || this.isPerfectSquare(b);
        },

        /**
         * 判断是否为回文数
         * @public
         * @param {number} num - 要判断的数字
         * @returns {boolean} 是否为回文数
         */
        isPalindrome: function (num) {
            if (!this.isInteger(num) || num < 0) {
                return false;
            }
            var str = num.toString();
            return str === str.split('').reverse().join('');
        },

        /**
         * 判断是否为阿姆斯特朗数
         * @public
         * @param {number} num - 要判断的数字
         * @returns {boolean} 是否为阿姆斯特朗数
         */
        isArmstrong: function (num) {
            if (!this.isInteger(num) || num < 0) {
                return false;
            }
            var str = num.toString();
            var len = str.length;
            var sum = 0;
            for (var i = 0; i < len; i++) {
                sum += Math.pow(parseInt(str[i], 10), len);
            }
            return sum === num;
        },

        /**
         * 判断是否为快乐数
         * @public
         * @param {number} num - 要判断的数字
         * @returns {boolean} 是否为快乐数
         */
        isHappy: function (num) {
            if (!this.isInteger(num) || num < 1) {
                return false;
            }
            var seen = {};
            while (num !== 1 && !seen[num]) {
                seen[num] = true;
                var sum = 0;
                var str = num.toString();
                for (var i = 0; i < str.length; i++) {
                    sum += Math.pow(parseInt(str[i], 10), 2);
                }
                num = sum;
            }
            return num === 1;
        },

        /**
         * 判断是否为丑数
         * @public
         * @param {number} num - 要判断的数字
         * @returns {boolean} 是否为丑数
         */
        isUgly: function (num) {
            if (!this.isInteger(num) || num < 1) {
                return false;
            }
            while (num % 2 === 0) {
                num /= 2;
            }
            while (num % 3 === 0) {
                num /= 3;
            }
            while (num % 5 === 0) {
                num /= 5;
            }
            return num === 1;
        },

        /**
         * 判断是否为哈沙德数
         * @public
         * @param {number} num - 要判断的数字
         * @returns {boolean} 是否为哈沙德数
         */
        isHarshad: function (num) {
            if (!this.isInteger(num) || num < 1) {
                return false;
            }
            var sum = 0;
            var str = num.toString();
            for (var i = 0; i < str.length; i++) {
                sum += parseInt(str[i], 10);
            }
            return num % sum === 0;
        },

        /**
         * 判断是否为过剩数
         * @public
         * @param {number} num - 要判断的数字
         * @returns {boolean} 是否为过剩数
         */
        isAbundant: function (num) {
            if (!this.isInteger(num) || num < 1) {
                return false;
            }
            var sum = 0;
            for (var i = 1; i < num; i++) {
                if (num % i === 0) {
                    sum += i;
                }
            }
            return sum > num;
        },

        /**
         * 判断是否为亏数
         * @public
         * @param {number} num - 要判断的数字
         * @returns {boolean} 是否为亏数
         */
        isDeficient: function (num) {
            if (!this.isInteger(num) || num < 1) {
                return false;
            }
            var sum = 0;
            for (var i = 1; i < num; i++) {
                if (num % i === 0) {
                    sum += i;
                }
            }
            return sum < num;
        },

        /**
         * 判断是否为完全数
         * @public
         * @param {number} num - 要判断的数字
         * @returns {boolean} 是否为完全数
         */
        isPerfect: function (num) {
            if (!this.isInteger(num) || num < 1) {
                return false;
            }
            var sum = 0;
            for (var i = 1; i < num; i++) {
                if (num % i === 0) {
                    sum += i;
                }
            }
            return sum === num;
        },

        /**
         * 判断是否为友好数
         * @public
         * @param {number} num1 - 第一个数字
         * @param {number} num2 - 第二个数字
         * @returns {boolean} 是否为友好数
         */
        isAmicable: function (num1, num2) {
            if (!this.isInteger(num1) || !this.isInteger(num2) || num1 < 1 || num2 < 1) {
                return false;
            }
            var sum1 = 0;
            var sum2 = 0;
            for (var i = 1; i < num1; i++) {
                if (num1 % i === 0) {
                    sum1 += i;
                }
            }
            for (var j = 1; j < num2; j++) {
                if (num2 % j === 0) {
                    sum2 += j;
                }
            }
            return sum1 === num2 && sum2 === num1 && num1 !== num2;
        },

        /**
         * 判断是否为 sociable 数
         * @public
         * @param {Array} nums - 数字数组
         * @returns {boolean} 是否为 sociable 数
         */
        isSociable: function (nums) {
            if (!this.isArray(nums) || nums.length < 2) {
                return false;
            }
            var len = nums.length;
            for (var i = 0; i < len; i++) {
                if (!this.isInteger(nums[i]) || nums[i] < 1) {
                    return false;
                }
                var sum = 0;
                for (var j = 1; j < nums[i]; j++) {
                    if (nums[i] % j === 0) {
                        sum += j;
                    }
                }
                if (sum !== nums[(i + 1) % len]) {
                    return false;
                }
            }
            return true;
        },

        /**
         * 判断是否为 practical 数
         * @public
         * @param {number} num - 要判断的数字
         * @returns {boolean} 是否为 practical 数
         */
        isPractical: function (num) {
            if (!this.isInteger(num) || num < 1) {
                return false;
            }
            var divisors = [1];
            for (var i = 2; i <= num; i++) {
                if (num % i === 0) {
                    divisors.push(i);
                }
            }
            var sums = [0];
            for (var j = 0; j < divisors.length; j++) {
                var currentSums = sums.slice();
                for (var k = 0; k < currentSums.length; k++) {
                    var newSum = currentSums[k] + divisors[j];
                    if (newSum <= num && sums.indexOf(newSum) === -1) {
                        sums.push(newSum);
                    }
                }
            }
            for (var m = 1; m <= num; m++) {
                if (sums.indexOf(m) === -1) {
                    return false;
                }
            }
            return true;
        },

        /**
         * 判断是否为 semiperfect 数
         * @public
         * @param {number} num - 要判断的数字
         * @returns {boolean} 是否为 semiperfect 数
         */
        isSemiperfect: function (num) {
            if (!this.isInteger(num) || num < 1) {
                return false;
            }
            var divisors = [];
            for (var i = 1; i < num; i++) {
                if (num % i === 0) {
                    divisors.push(i);
                }
            }
            var len = divisors.length;
            var max = 1 << len;
            for (var j = 1; j < max; j++) {
                var sum = 0;
                for (var k = 0; k < len; k++) {
                    if (j & (1 << k)) {
                        sum += divisors[k];
                    }
                }
                if (sum === num) {
                    return true;
                }
            }
            return false;
        },

        /**
         * 判断是否为 weird 数
         * @public
         * @param {number} num - 要判断的数字
         * @returns {boolean} 是否为 weird 数
         */
        isWeird: function (num) {
            return this.isAbundant(num) && !this.isSemiperfect(num);
        },

        /**
         * 判断是否为 automorphic 数
         * @public
         * @param {number} num - 要判断的数字
         * @returns {boolean} 是否为 automorphic 数
         */
        isAutomorphic: function (num) {
            if (!this.isInteger(num) || num < 0) {
                return false;
            }
            var square = num * num;
            var strNum = num.toString();
            var strSquare = square.toString();
            return strSquare.endsWith(strNum);
        },

        /**
         * 判断是否为 trimorphic 数
         * @public
         * @param {number} num - 要判断的数字
         * @returns {boolean} 是否为 trimorphic 数
         */
        isTrimorphic: function (num) {
            if (!this.isInteger(num) || num < 0) {
                return false;
            }
            var cube = num * num * num;
            var strNum = num.toString();
            var strCube = cube.toString();
            return strCube.endsWith(strNum);
        },

        /**
         * 判断是否为 cyclic 数
         * @public
         * @param {number} num - 要判断的数字
         * @returns {boolean} 是否为 cyclic 数
         */
        isCyclic: function (num) {
            if (!this.isInteger(num) || num < 1) {
                return false;
            }
            var str = num.toString();
            var len = str.length;
            var rotations = [];
            for (var i = 0; i < len; i++) {
                rotations.push(str.slice(i) + str.slice(0, i));
            }
            for (var j = 0; j < rotations.length; j++) {
                var rotated = parseInt(rotations[j], 10);
                var product = num * (j + 1);
                if (product !== rotated) {
                    return false;
                }
            }
            return true;
        },

        /**
         * 判断是否为 pandigital 数
         * @public
         * @param {number} num - 要判断的数字
         * @returns {boolean} 是否为 pandigital 数
         */
        isPandigital: function (num) {
            if (!this.isInteger(num) || num < 0) {
                return false;
            }
            var str = num.toString();
            var len = str.length;
            var digits = [];
            for (var i = 0; i < len; i++) {
                var digit = parseInt(str[i], 10);
                if (digits.indexOf(digit) !== -1) {
                    return false;
                }
                digits.push(digit);
            }
            for (var j = 0; j < len; j++) {
                if (digits.indexOf(j) === -1) {
                    return false;
                }
            }
            return true;
        },

        /**
         * 判断是否为 narcissistic 数
         * @public
         * @param {number} num - 要判断的数字
         * @returns {boolean} 是否为 narcissistic 数
         */
        isNarcissistic: function (num) {
            return this.isArmstrong(num);
        },

        /**
         * 判断是否为 Smith 数
         * @public
         * @param {number} num - 要判断的数字
         * @returns {boolean} 是否为 Smith 数
         */
        isSmith: function (num) {
            if (!this.isInteger(num) || num < 4) {
                return false;
            }
            if (this.isPrime(num)) {
                return false;
            }
            var sumDigits = 0;
            var str = num.toString();
            for (var i = 0; i < str.length; i++) {
                sumDigits += parseInt(str[i], 10);
            }
            var sumPrimeFactors = 0;
            var n = num;
            for (var p = 2; p * p <= n; p++) {
                while (n % p === 0) {
                    var factorStr = p.toString();
                    for (var j = 0; j < factorStr.length; j++) {
                        sumPrimeFactors += parseInt(factorStr[j], 10);
                    }
                    n /= p;
                }
            }
            if (n > 1) {
                var factorStr = n.toString();
                for (var k = 0; k < factorStr.length; k++) {
                    sumPrimeFactors += parseInt(factorStr[k], 10);
                }
            }
            return sumDigits === sumPrimeFactors;
        },

        /**
         * 判断是否为 sphenic 数
         * @public
         * @param {number} num - 要判断的数字
         * @returns {boolean} 是否为 sphenic 数
         */
        isSphenic: function (num) {
            if (!this.isInteger(num) || num < 30) {
                return false;
            }
            var count = 0;
            var product = 1;
            var n = num;
            for (var p = 2; p * p <= n; p++) {
                if (n % p === 0) {
                    count++;
                    product *= p;
                    while (n % p === 0) {
                        n /= p;
                    }
                }
            }
            if (n > 1) {
                count++;
                product *= n;
            }
            return count === 3 && product === num;
        },

        /**
         * 判断是否为 powerful 数
         * @public
         * @param {number} num - 要判断的数字
         * @returns {boolean} 是否为 powerful 数
         */
        isPowerful: function (num) {
            if (!this.isInteger(num) || num < 1) {
                return false;
            }
            var n = num;
            for (var p = 2; p * p <= n; p++) {
                if (n % p === 0) {
                    var count = 0;
                    while (n % p === 0) {
                        n /= p;
                        count++;
                    }
                    if (count < 2) {
                        return false;
                    }
                }
            }
            return true;
        },

        /**
         * 判断是否为 Achilles 数
         * @public
         * @param {number} num - 要判断的数字
         * @returns {boolean} 是否为 Achilles 数
         */
        isAchilles: function (num) {
            if (!this.isInteger(num) || num < 72) {
                return false;
            }
            if (!this.isPowerful(num)) {
                return false;
            }
            var n = num;
            var gcd = 0;
            for (var p = 2; p * p <= n; p++) {
                if (n % p === 0) {
                    var count = 0;
                    while (n % p === 0) {
                        n /= p;
                        count++;
                    }
                    gcd = gcd === 0 ? count : this.gcd(gcd, count);
                }
            }
            return gcd === 1;
        },

        /**
         * 计算最大公约数
         * @public
         * @param {number} a - 第一个数字
         * @param {number} b - 第二个数字
         * @returns {number} 最大公约数
         */
        gcd: function (a, b) {
            while (b !== 0) {
                var temp = b;
                b = a % b;
                a = temp;
            }
            return a;
        },

        /**
         * 计算最小公倍数
         * @public
         * @param {number} a - 第一个数字
         * @param {number} b - 第二个数字
         * @returns {number} 最小公倍数
         */
        lcm: function (a, b) {
            return Math.abs(a * b) / this.gcd(a, b);
        },

        /**
         * 计算阶乘
         * @public
         * @param {number} num - 数字
         * @returns {number} 阶乘结果
         */
        factorial: function (num) {
            if (!this.isInteger(num) || num < 0) {
                return NaN;
            }
            if (num === 0 || num === 1) {
                return 1;
            }
            var result = 1;
            for (var i = 2; i <= num; i++) {
                result *= i;
            }
            return result;
        },

        /**
         * 计算斐波那契数
         * @public
         * @param {number} n - 索引
         * @returns {number} 斐波那契数
         */
        fibonacci: function (n) {
            if (!this.isInteger(n) || n < 0) {
                return NaN;
            }
            if (n === 0) {
                return 0;
            }
            if (n === 1) {
                return 1;
            }
            var a = 0;
            var b = 1;
            for (var i = 2; i <= n; i++) {
                var temp = a + b;
                a = b;
                b = temp;
            }
            return b;
        },

        /**
         * 计算组合数
         * @public
         * @param {number} n - 总数
         * @param {number} k - 选择数
         * @returns {number} 组合数
         */
        combination: function (n, k) {
            if (!this.isInteger(n) || !this.isInteger(k) || n < 0 || k < 0 || k > n) {
                return NaN;
            }
            if (k === 0 || k === n) {
                return 1;
            }
            k = Math.min(k, n - k);
            var result = 1;
            for (var i = 0; i < k; i++) {
                result = result * (n - i) / (i + 1);
            }
            return result;
        },

        /**
         * 计算排列数
         * @public
         * @param {number} n - 总数
         * @param {number} k - 选择数
         * @returns {number} 排列数
         */
        permutation: function (n, k) {
            if (!this.isInteger(n) || !this.isInteger(k) || n < 0 || k < 0 || k > n) {
                return NaN;
            }
            var result = 1;
            for (var i = 0; i < k; i++) {
                result *= (n - i);
            }
            return result;
        },

        /**
         * 计算幂
         * @public
         * @param {number} base - 底数
         * @param {number} exponent - 指数
         * @returns {number} 幂结果
         */
        power: function (base, exponent) {
            if (!this.isNumber(base) || !this.isNumber(exponent)) {
                return NaN;
            }
            return Math.pow(base, exponent);
        },

        /**
         * 计算根
         * @public
         * @param {number} num - 数字
         * @param {number} root - 根指数
         * @returns {number} 根结果
         */
        root: function (num, root) {
            if (!this.isNumber(num) || !this.isNumber(root)) {
                return NaN;
            }
            return Math.pow(num, 1 / root);
        },

        /**
         * 计算对数
         * @public
         * @param {number} num - 数字
         * @param {number} [base] - 底数，默认为e
         * @returns {number} 对数结果
         */
        log: function (num, base) {
            if (!this.isNumber(num)) {
                return NaN;
            }
            if (base === undefined) {
                return Math.log(num);
            }
            if (!this.isNumber(base)) {
                return NaN;
            }
            return Math.log(num) / Math.log(base);
        },

        /**
         * 计算正弦
         * @public
         * @param {number} num - 角度（弧度）
         * @returns {number} 正弦值
         */
        sin: function (num) {
            if (!this.isNumber(num)) {
                return NaN;
            }
            return Math.sin(num);
        },

        /**
         * 计算余弦
         * @public
         * @param {number} num - 角度（弧度）
         * @returns {number} 余弦值
         */
        cos: function (num) {
            if (!this.isNumber(num)) {
                return NaN;
            }
            return Math.cos(num);
        },

        /**
         * 计算正切
         * @public
         * @param {number} num - 角度（弧度）
         * @returns {number} 正切值
         */
        tan: function (num) {
            if (!this.isNumber(num)) {
                return NaN;
            }
            return Math.tan(num);
        },

        /**
         * 计算反正弦
         * @public
         * @param {number} num - 数字
         * @returns {number} 反正弦值
         */
        asin: function (num) {
            if (!this.isNumber(num)) {
                return NaN;
            }
            return Math.asin(num);
        },

        /**
         * 计算反余弦
         * @public
         * @param {number} num - 数字
         * @returns {number} 反余弦值
         */
        acos: function (num) {
            if (!this.isNumber(num)) {
                return NaN;
            }
            return Math.acos(num);
        },

        /**
         * 计算反正切
         * @public
         * @param {number} num - 数字
         * @returns {number} 反正切值
         */
        atan: function (num) {
            if (!this.isNumber(num)) {
                return NaN;
            }
            return Math.atan(num);
        },

        /**
         * 计算双曲正弦
         * @public
         * @param {number} num - 数字
         * @returns {number} 双曲正弦值
         */
        sinh: function (num) {
            if (!this.isNumber(num)) {
                return NaN;
            }
            return Math.sinh(num);
        },

        /**
         * 计算双曲余弦
         * @public
         * @param {number} num - 数字
         * @returns {number} 双曲余弦值
         */
        cosh: function (num) {
            if (!this.isNumber(num)) {
                return NaN;
            }
            return Math.cosh(num);
        },

        /**
         * 计算双曲正切
         * @public
         * @param {number} num - 数字
         * @returns {number} 双曲正切值
         */
        tanh: function (num) {
            if (!this.isNumber(num)) {
                return NaN;
            }
            return Math.tanh(num);
        },

        /**
         * 计算绝对值
         * @public
         * @param {number} num - 数字
         * @returns {number} 绝对值
         */
        abs: function (num) {
            if (!this.isNumber(num)) {
                return NaN;
            }
            return Math.abs(num);
        },

        /**
         * 计算向上取整
         * @public
         * @param {number} num - 数字
         * @returns {number} 向上取整结果
         */
        ceil: function (num) {
            if (!this.isNumber(num)) {
                return NaN;
            }
            return Math.ceil(num);
        },

        /**
         * 计算向下取整
         * @public
         * @param {number} num - 数字
         * @returns {number} 向下取整结果
         */
        floor: function (num) {
            if (!this.isNumber(num)) {
                return NaN;
            }
            return Math.floor(num);
        },

        /**
         * 计算四舍五入
         * @public
         * @param {number} num - 数字
         * @param {number} [decimals] - 小数位数
         * @returns {number} 四舍五入结果
         */
        round: function (num, decimals) {
            if (!this.isNumber(num)) {
                return NaN;
            }
            if (decimals === undefined) {
                return Math.round(num);
            }
            if (!this.isNumber(decimals)) {
                return NaN;
            }
            var factor = Math.pow(10, decimals);
            return Math.round(num * factor) / factor;
        },

        /**
         * 计算截断
         * @public
         * @param {number} num - 数字
         * @param {number} [decimals] - 小数位数
         * @returns {number} 截断结果
         */
        trunc: function (num, decimals) {
            if (!this.isNumber(num)) {
                return NaN;
            }
            if (decimals === undefined) {
                return Math.trunc(num);
            }
            if (!this.isNumber(decimals)) {
                return NaN;
            }
            var factor = Math.pow(10, decimals);
            return Math.trunc(num * factor) / factor;
        },

        /**
         * 计算符号
         * @public
         * @param {number} num - 数字
         * @returns {number} 符号
         */
        sign: function (num) {
            if (!this.isNumber(num)) {
                return NaN;
            }
            return Math.sign(num);
        },

        /**
         * 计算随机数
         * @public
         * @param {number} [min] - 最小值
         * @param {number} [max] - 最大值
         * @returns {number} 随机数
         */
        random: function (min, max) {
            if (min === undefined) {
                return Math.random();
            }
            if (!this.isNumber(min)) {
                return NaN;
            }
            if (max === undefined) {
                return Math.random() * min;
            }
            if (!this.isNumber(max)) {
                return NaN;
            }
            return Math.random() * (max - min) + min;
        },

        /**
         * 生成随机整数
         * @public
         * @param {number} min - 最小值
         * @param {number} max - 最大值
         * @returns {number} 随机整数
         */
        randomInt: function (min, max) {
            if (!this.isNumber(min) || !this.isNumber(max)) {
                return NaN;
            }
            return Math.floor(Math.random() * (max - min + 1)) + min;
        },

        /**
         * 生成随机布尔值
         * @public
         * @returns {boolean} 随机布尔值
         */
        randomBool: function () {
            return Math.random() < 0.5;
        },

        /**
         * 生成随机颜色
         * @public
         * @returns {string} 随机颜色
         */
        randomColor: function () {
            var r = this.randomInt(0, 255);
            var g = this.randomInt(0, 255);
            var b = this.randomInt(0, 255);
            return 'rgb(' + r + ', ' + g + ', ' + b + ')';
        },

        /**
         * 生成随机十六进制颜色
         * @public
         * @returns {string} 随机十六进制颜色
         */
        randomHexColor: function () {
            var r = this.randomInt(0, 255).toString(16).padStart(2, '0');
            var g = this.randomInt(0, 255).toString(16).padStart(2, '0');
            var b = this.randomInt(0, 255).toString(16).padStart(2, '0');
            return '#' + r + g + b;
        },

        /**
         * 生成UUID
         * @public
         * @returns {string} UUID
         */
        uuid: function () {
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                var r = Math.random() * 16 | 0;
                var v = c === 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);
            });
        },

        /**
         * 生成GUID
         * @public
         * @returns {string} GUID
         */
        guid: function () {
            return this.uuid();
        },

        /**
         * 生成唯一ID
         * @public
         * @param {string} [prefix] - 前缀
         * @returns {string} 唯一ID
         */
        uniqueId: function (prefix) {
            var id = Date.now().toString(36) + Math.random().toString(36).substr(2);
            return prefix ? prefix + id : id;
        },

        /**
         * 生成随机字符串
         * @public
         * @param {number} [length] - 长度
         * @param {string} [chars] - 字符集
         * @returns {string} 随机字符串
         */
        randomString: function (length, chars) {
            length = length || 8;
            chars = chars || 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
            var result = '';
            for (var i = 0; i < length; i++) {
                result += chars.charAt(Math.floor(Math.random() * chars.length));
            }
            return result;
        },

        /**
         * 生成随机字母字符串
         * @public
         * @param {number} [length] - 长度
         * @returns {string} 随机字母字符串
         */
        randomAlpha: function (length) {
            return this.randomString(length, 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz');
        },

        /**
         * 生成随机数字字符串
         * @public
         * @param {number} [length] - 长度
         * @returns {string} 随机数字字符串
         */
        randomNumeric: function (length) {
            return this.randomString(length, '0123456789');
        },

        /**
         * 生成随机字母数字字符串
         * @public
         * @param {number} [length] - 长度
         * @returns {string} 随机字母数字字符串
         */
        randomAlphaNumeric: function (length) {
            return this.randomString(length);
        },

        /**
         * 生成随机密码
         * @public
         * @param {number} [length] - 长度
         * @returns {string} 随机密码
         */
        randomPassword: function (length) {
            length = length || 12;
            var upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
            var lower = 'abcdefghijklmnopqrstuvwxyz';
            var numbers = '0123456789';
            var special = '!@#$%^&*()_+-=[]{}|;:,.<>?';
            var all = upper + lower + numbers + special;
            var result = '';
            result += upper.charAt(Math.floor(Math.random() * upper.length));
            result += lower.charAt(Math.floor(Math.random() * lower.length));
            result += numbers.charAt(Math.floor(Math.random() * numbers.length));
            result += special.charAt(Math.floor(Math.random() * special.length));
            for (var i = 4; i < length; i++) {
                result += all.charAt(Math.floor(Math.random() * all.length));
            }
            return result.split('').sort(function () {
                return 0.5 - Math.random();
            }).join('');
        },

        /**
         * 字符串转驼峰
         * @public
         * @param {string} str - 字符串
         * @returns {string} 驼峰字符串
         */
        camelCase: function (str) {
            return str.replace(/[-_](.)/g, function (match, group1) {
                return group1.toUpperCase();
            });
        },

        /**
         * 字符串转短横线
         * @public
         * @param {string} str - 字符串
         * @returns {string} 短横线字符串
         */
        kebabCase: function (str) {
            return str.replace(/([A-Z])/g, '-$1').toLowerCase().replace(/^-/, '');
        },

        /**
         * 字符串转下划线
         * @public
         * @param {string} str - 字符串
         * @returns {string} 下划线字符串
         */
        snakeCase: function (str) {
            return str.replace(/([A-Z])/g, '_$1').toLowerCase().replace(/^_/, '');
        },

        /**
         * 字符串转首字母大写
         * @public
         * @param {string} str - 字符串
         * @returns {string} 首字母大写字符串
         */
        capitalize: function (str) {
            return str.charAt(0).toUpperCase() + str.slice(1);
        },

        /**
         * 字符串转首字母小写
         * @public
         * @param {string} str - 字符串
         * @returns {string} 首字母小写字符串
         */
        uncapitalize: function (str) {
            return str.charAt(0).toLowerCase() + str.slice(1);
        },

        /**
         * 字符串转大写
         * @public
         * @param {string} str - 字符串
         * @returns {string} 大写字符串
         */
        upperCase: function (str) {
            return str.toUpperCase();
        },

        /**
         * 字符串转小写
         * @public
         * @param {string} str - 字符串
         * @returns {string} 小写字符串
         */
        lowerCase: function (str) {
            return str.toLowerCase();
        },

        /**
         * 字符串转标题
         * @public
         * @param {string} str - 字符串
         * @returns {string} 标题字符串
         */
        titleCase: function (str) {
            return str.replace(/\w\S*/g, function (txt) {
                return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
            });
        },

        /**
         * 字符串转句子
         * @public
         * @param {string} str - 字符串
         * @returns {string} 句子字符串
         */
        sentenceCase: function (str) {
            return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
        },

        /**
         * 字符串反转
         * @public
         * @param {string} str - 字符串
         * @returns {string} 反转字符串
         */
        reverse: function (str) {
            return str.split('').reverse().join('');
        },

        /**
         * 字符串截断
         * @public
         * @param {string} str - 字符串
         * @param {number} [length] - 长度
         * @param {string} [suffix] - 后缀
         * @returns {string} 截断字符串
         */
        truncate: function (str, length, suffix) {
            length = length || 30;
            suffix = suffix || '...';
            if (str.length <= length) {
                return str;
            }
            return str.substring(0, length - suffix.length) + suffix;
        },

        /**
         * 字符串填充
         * @public
         * @param {string} str - 字符串
         * @param {number} length - 长度
         * @param {string} [chars] - 填充字符
         * @param {string} [side] - 填充方向
         * @returns {string} 填充字符串
         */
        pad: function (str, length, chars, side) {
            chars = chars || ' ';
            side = side || 'right';
            var padLength = length - str.length;
            if (padLength <= 0) {
                return str;
            }
            var padding = chars.repeat(Math.ceil(padLength / chars.length)).substring(0, padLength);
            if (side === 'left') {
                return padding + str;
            } else if (side === 'both') {
                var leftPad = Math.floor(padLength / 2);
                var rightPad = padLength - leftPad;
                return chars.repeat(Math.ceil(leftPad / chars.length)).substring(0, leftPad) + str +
                    chars.repeat(Math.ceil(rightPad / chars.length)).substring(0, rightPad);
            }
            return str + padding;
        },

        /**
         * 字符串左填充
         * @public
         * @param {string} str - 字符串
         * @param {number} length - 长度
         * @param {string} [chars] - 填充字符
         * @returns {string} 左填充字符串
         */
        padLeft: function (str, length, chars) {
            return this.pad(str, length, chars, 'left');
        },

        /**
         * 字符串右填充
         * @public
         * @param {string} str - 字符串
         * @param {number} length - 长度
         * @param {string} [chars] - 填充字符
         * @returns {string} 右填充字符串
         */
        padRight: function (str, length, chars) {
            return this.pad(str, length, chars, 'right');
        },

        /**
         * 字符串两端填充
         * @public
         * @param {string} str - 字符串
         * @param {number} length - 长度
         * @param {string} [chars] - 填充字符
         * @returns {string} 两端填充字符串
         */
        padBoth: function (str, length, chars) {
            return this.pad(str, length, chars, 'both');
        },

        /**
         * 字符串去空白
         * @public
         * @param {string} str - 字符串
         * @returns {string} 去空白字符串
         */
        trim: function (str) {
            return str.trim();
        },

        /**
         * 字符串去左空白
         * @public
         * @param {string} str - 字符串
         * @returns {string} 去左空白字符串
         */
        trimLeft: function (str) {
            return str.replace(/^\s+/, '');
        },

        /**
         * 字符串去右空白
         * @public
         * @param {string} str - 字符串
         * @returns {string} 去右空白字符串
         */
        trimRight: function (str) {
            return str.replace(/\s+$/, '');
        },

        /**
         * 字符串去所有空白
         * @public
         * @param {string} str - 字符串
         * @returns {string} 去所有空白字符串
         */
        trimAll: function (str) {
            return str.replace(/\s/g, '');
        },

        /**
         * 字符串去多余空白
         * @public
         * @param {string} str - 字符串
         * @returns {string} 去多余空白字符串
         */
        trimExtra: function (str) {
            return str.replace(/\s+/g, ' ').trim();
        },

        /**
         * 字符串去HTML标签
         * @public
         * @param {string} str - 字符串
         * @returns {string} 去HTML标签字符串
         */
        stripTags: function (str) {
            return str.replace(/<[^>]*>/g, '');
        },

        /**
         * 字符串转HTML实体
         * @public
         * @param {string} str - 字符串
         * @returns {string} HTML实体字符串
         */
        escapeHtml: function (str) {
            var div = document.createElement('div');
            div.appendChild(document.createTextNode(str));
            return div.innerHTML;
        },

        /**
         * HTML实体转字符串
         * @public
         * @param {string} str - 字符串
         * @returns {string} 字符串
         */
        unescapeHtml: function (str) {
            var div = document.createElement('div');
            div.innerHTML = str;
            return div.textContent || div.innerText || '';
        },

        /**
         * 字符串转正则表达式
         * @public
         * @param {string} str - 字符串
         * @returns {RegExp} 正则表达式
         */
        escapeRegExp: function (str) {
            return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        },

        /**
         * 字符串转URL编码
         * @public
         * @param {string} str - 字符串
         * @returns {string} URL编码字符串
         */
        encodeUrl: function (str) {
            return encodeURIComponent(str);
        },

        /**
         * URL编码转字符串
         * @public
         * @param {string} str - 字符串
         * @returns {string} 字符串
         */
        decodeUrl: function (str) {
            return decodeURIComponent(str);
        },

        /**
         * 字符串转Base64
         * @public
         * @param {string} str - 字符串
         * @returns {string} Base64字符串
         */
        encodeBase64: function (str) {
            return btoa(str);
        },

        /**
         * Base64转字符串
         * @public
         * @param {string} str - 字符串
         * @returns {string} 字符串
         */
        decodeBase64: function (str) {
            return atob(str);
        },

        /**
         * 字符串转JSON
         * @public
         * @param {string} str - 字符串
         * @returns {Object} JSON对象
         */
        parseJson: function (str) {
            return JSON.parse(str);
        },

        /**
         * JSON转字符串
         * @public
         * @param {Object} obj - JSON对象
         * @returns {string} 字符串
         */
        stringifyJson: function (obj) {
            return JSON.stringify(obj);
        },

        /**
         * 字符串转XML
         * @public
         * @param {string} str - 字符串
         * @returns {Document} XML文档
         */
        parseXml: function (str) {
            var parser = new DOMParser();
            return parser.parseFromString(str, 'text/xml');
        },

        /**
         * XML转字符串
         * @public
         * @param {Document} xml - XML文档
         * @returns {string} 字符串
         */
        stringifyXml: function (xml) {
            var serializer = new XMLSerializer();
            return serializer.serializeToString(xml);
        },

        /**
         * 字符串转日期
         * @public
         * @param {string} str - 字符串
         * @param {string} [format] - 格式
         * @returns {Date} 日期对象
         */
        parseDate: function (str, format) {
            if (!format) {
                return new Date(str);
            }
            var parts = str.match(/(\d+)/g);
            var fmtParts = format.match(/(yyyy|MM|dd|HH|mm|ss)/g);
            var date = new Date();
            for (var i = 0; i < fmtParts.length; i++) {
                var part = parseInt(parts[i], 10);
                switch (fmtParts[i]) {
                    case 'yyyy':
                        date.setFullYear(part);
                        break;
                    case 'MM':
                        date.setMonth(part - 1);
                        break;
                    case 'dd':
                        date.setDate(part);
                        break;
                    case 'HH':
                        date.setHours(part);
                        break;
                    case 'mm':
                        date.setMinutes(part);
                        break;
                    case 'ss':
                        date.setSeconds(part);
                        break;
                }
            }
            return date;
        },

        /**
         * 日期转字符串
         * @public
         * @param {Date} date - 日期对象
         * @param {string} [format] - 格式
         * @returns {string} 字符串
         */
        formatDate: function (date, format) {
            if (!format) {
                return date.toISOString();
            }
            var map = {
                'yyyy': date.getFullYear(),
                'MM': this.digit(date.getMonth() + 1, 2),
                'dd': this.digit(date.getDate(), 2),
                'HH': this.digit(date.getHours(), 2),
                'mm': this.digit(date.getMinutes(), 2),
                'ss': this.digit(date.getSeconds(), 2)
            };
            return format.replace(/(yyyy|MM|dd|HH|mm|ss)/g, function (match) {
                return map[match];
            });
        },

        /**
         * 字符串转数字
         * @public
         * @param {string} str - 字符串
         * @returns {number} 数字
         */
        parseNumber: function (str) {
            return parseFloat(str);
        },

        /**
         * 数字转字符串
         * @public
         * @param {number} num - 数字
         * @param {number} [decimals] - 小数位数
         * @returns {string} 字符串
         */
        formatNumber: function (num, decimals) {
            if (decimals !== undefined) {
                return num.toFixed(decimals);
            }
            return num.toString();
        },

        /**
         * 数字转货币
         * @public
         * @param {number} num - 数字
         * @param {string} [symbol] - 货币符号
         * @param {number} [decimals] - 小数位数
         * @returns {string} 货币字符串
         */
        formatCurrency: function (num, symbol, decimals) {
            symbol = symbol || '$';
            decimals = decimals !== undefined ? decimals : 2;
            return symbol + num.toFixed(decimals).replace(/\d(?=(\d{3})+\.)/g, '$&,');
        },

        /**
         * 数字转百分比
         * @public
         * @param {number} num - 数字
         * @param {number} [decimals] - 小数位数
         * @returns {string} 百分比字符串
         */
        formatPercent: function (num, decimals) {
            decimals = decimals !== undefined ? decimals : 2;
            return (num * 100).toFixed(decimals) + '%';
        },

        /**
         * 数字转科学计数法
         * @public
         * @param {number} num - 数字
         * @param {number} [decimals] - 小数位数
         * @returns {string} 科学计数法字符串
         */
        formatScientific: function (num, decimals) {
            if (decimals !== undefined) {
                return num.toExponential(decimals);
            }
            return num.toExponential();
        },

        /**
         * 数字转文件大小
         * @public
         * @param {number} bytes - 字节数
         * @param {number} [decimals] - 小数位数
         * @returns {string} 文件大小字符串
         */
        formatFileSize: function (bytes, decimals) {
            if (bytes === 0) {
                return '0 Bytes';
            }
            var k = 1024;
            var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
            var i = Math.floor(Math.log(bytes) / Math.log(k));
            decimals = decimals !== undefined ? decimals : 2;
            return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + ' ' + sizes[i];
        },

        /**
         * 数字转千分位
         * @public
         * @param {number} num - 数字
         * @returns {string} 千分位字符串
         */
        formatThousand: function (num) {
            return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        },

        /**
         * 千分位转数字
         * @public
         * @param {string} str - 字符串
         * @returns {number} 数字
         */
        parseThousand: function (str) {
            return parseFloat(str.replace(/,/g, ''));
        },

        /**
         * 字符串转布尔值
         * @public
         * @param {string} str - 字符串
         * @returns {boolean} 布尔值
         */
        parseBoolean: function (str) {
            return str.toLowerCase() === 'true' || str === '1';
        },

        /**
         * 布尔值转字符串
         * @public
         * @param {boolean} bool - 布尔值
         * @returns {string} 字符串
         */
        formatBoolean: function (bool) {
            return bool ? 'true' : 'false';
        },

        /**
         * 字符串转数组
         * @public
         * @param {string} str - 字符串
         * @param {string} [separator] - 分隔符
         * @returns {Array} 数组
         */
        parseArray: function (str, separator) {
            separator = separator || ',';
            return str.split(separator);
        },

        /**
         * 数组转字符串
         * @public
         * @param {Array} arr - 数组
         * @param {string} [separator] - 分隔符
         * @returns {string} 字符串
         */
        formatArray: function (arr, separator) {
            separator = separator || ',';
            return arr.join(separator);
        },

        /**
         * 字符串转对象
         * @public
         * @param {string} str - 字符串
         * @returns {Object} 对象
         */
        parseObject: function (str) {
            return JSON.parse(str);
        },

        /**
         * 对象转字符串
         * @public
         * @param {Object} obj - 对象
         * @returns {string} 字符串
         */
        formatObject: function (obj) {
            return JSON.stringify(obj);
        },

        /**
         * 深拷贝
         * @public
         * @param {*} obj - 要拷贝的对象
         * @returns {*} 拷贝后的对象
         */
        deepClone: function (obj) {
            if (obj === null || typeof obj !== 'object') {
                return obj;
            }
            if (obj instanceof Date) {
                return new Date(obj.getTime());
            }
            if (obj instanceof Array) {
                var arrCopy = [];
                for (var i = 0; i < obj.length; i++) {
                    arrCopy[i] = this.deepClone(obj[i]);
                }
                return arrCopy;
            }
            if (obj instanceof Object) {
                var objCopy = {};
                for (var key in obj) {
                    if (obj.hasOwnProperty(key)) {
                        objCopy[key] = this.deepClone(obj[key]);
                    }
                }
                return objCopy;
            }
            throw new Error('Unable to copy object! Its type isn\'t supported.');
        },

        /**
         * 浅拷贝
         * @public
         * @param {*} obj - 要拷贝的对象
         * @returns {*} 拷贝后的对象
         */
        shallowClone: function (obj) {
            if (obj === null || typeof obj !== 'object') {
                return obj;
            }
            if (obj instanceof Date) {
                return new Date(obj.getTime());
            }
            if (obj instanceof Array) {
                return obj.slice();
            }
            if (obj instanceof Object) {
                var objCopy = {};
                for (var key in obj) {
                    if (obj.hasOwnProperty(key)) {
                        objCopy[key] = obj[key];
                    }
                }
                return objCopy;
            }
            throw new Error('Unable to copy object! Its type isn\'t supported.');
        },

        /**
         * 合并对象
         * @public
         * @param {Object} target - 目标对象
         * @param {Object} source - 源对象
         * @param {boolean} [deep] - 是否深拷贝
         * @returns {Object} 合并后的对象
         */
        extend: function (target, source, deep) {
            if (deep) {
                for (var key in source) {
                    if (source.hasOwnProperty(key)) {
                        if (typeof source[key] === 'object' && source[key] !== null) {
                            if (typeof target[key] === 'object' && target[key] !== null) {
                                this.extend(target[key], source[key], true);
                            } else {
                                target[key] = this.deepClone(source[key]);
                            }
                        } else {
                            target[key] = source[key];
                        }
                    }
                }
            } else {
                for (var key in source) {
                    if (source.hasOwnProperty(key)) {
                        target[key] = source[key];
                    }
                }
            }
            return target;
        },

        /**
         * 判断对象是否相等
         * @public
         * @param {*} obj1 - 第一个对象
         * @param {*} obj2 - 第二个对象
         * @returns {boolean} 是否相等
         */
        isEqual: function (obj1, obj2) {
            if (obj1 === obj2) {
                return true;
            }
            if (obj1 === null || obj2 === null || typeof obj1 !== typeof obj2) {
                return false;
            }
            if (typeof obj1 === 'object') {
                var keys1 = Object.keys(obj1);
                var keys2 = Object.keys(obj2);
                if (keys1.length !== keys2.length) {
                    return false;
                }
                for (var i = 0; i < keys1.length; i++) {
                    if (!this.isEqual(obj1[keys1[i]], obj2[keys1[i]])) {
                        return false;
                    }
                }
                return true;
            }
            return false;
        },

        /**
         * 判断对象是否包含指定键
         * @public
         * @param {Object} obj - 对象
         * @param {string} key - 键
         * @returns {boolean} 是否包含
         */
        hasKey: function (obj, key) {
            return obj.hasOwnProperty(key);
        },

        /**
         * 获取对象键值
         * @public
         * @param {Object} obj - 对象
         * @param {string} key - 键
         * @param {*} [defaultValue] - 默认值
         * @returns {*} 键值
         */
        getValue: function (obj, key, defaultValue) {
            if (this.hasKey(obj, key)) {
                return obj[key];
            }
            return defaultValue;
        },

        /**
         * 设置对象键值
         * @public
         * @param {Object} obj - 对象
         * @param {string} key - 键
         * @param {*} value - 值
         * @returns {Object} 对象
         */
        setValue: function (obj, key, value) {
            obj[key] = value;
            return obj;
        },

        /**
         * 删除对象键值
         * @public
         * @param {Object} obj - 对象
         * @param {string} key - 键
         * @returns {Object} 对象
         */
        deleteKey: function (obj, key) {
            delete obj[key];
            return obj;
        },

        /**
         * 获取对象所有键
         * @public
         * @param {Object} obj - 对象
         * @returns {Array} 键数组
         */
        keys: function (obj) {
            return Object.keys(obj);
        },

        /**
         * 获取对象所有值
         * @public
         * @param {Object} obj - 对象
         * @returns {Array} 值数组
         */
        values: function (obj) {
            return Object.values(obj);
        },

        /**
         * 获取对象键值对
         * @public
         * @param {Object} obj - 对象
         * @returns {Array} 键值对数组
         */
        entries: function (obj) {
            return Object.entries(obj);
        },

        /**
         * 对象转数组
         * @public
         * @param {Object} obj - 对象
         * @returns {Array} 数组
         */
        toArray: function (obj) {
            var arr = [];
            for (var key in obj) {
                if (obj.hasOwnProperty(key)) {
                    arr.push({ key: key, value: obj[key] });
                }
            }
            return arr;
        },

        /**
         * 数组转对象
         * @public
         * @param {Array} arr - 数组
         * @returns {Object} 对象
         */
        toObject: function (arr) {
            var obj = {};
            for (var i = 0; i < arr.length; i++) {
                obj[arr[i].key] = arr[i].value;
            }
            return obj;
        },

        /**
         * 数组去重
         * @public
         * @param {Array} arr - 数组
         * @returns {Array} 去重后的数组
         */
        unique: function (arr) {
            return arr.filter(function (item, index, self) {
                return self.indexOf(item) === index;
            });
        },

        /**
         * 数组扁平化
         * @public
         * @param {Array} arr - 数组
         * @param {number} [depth] - 深度
         * @returns {Array} 扁平化后的数组
         */
        flatten: function (arr, depth) {
            depth = depth !== undefined ? depth : 1;
            return arr.reduce(function (flat, toFlatten) {
                return flat.concat((Array.isArray(toFlatten) && (depth > 1)) ? this.flatten(toFlatten, depth - 1) : toFlatten);
            }.bind(this), []);
        },

        /**
         * 数组分组
         * @public
         * @param {Array} arr - 数组
         * @param {number} size - 每组大小
         * @returns {Array} 分组后的数组
         */
        chunk: function (arr, size) {
            var chunks = [];
            for (var i = 0; i < arr.length; i += size) {
                chunks.push(arr.slice(i, i + size));
            }
            return chunks;
        },

        /**
         * 数组差集
         * @public
         * @param {Array} arr1 - 第一个数组
         * @param {Array} arr2 - 第二个数组
         * @returns {Array} 差集
         */
        difference: function (arr1, arr2) {
            return arr1.filter(function (item) {
                return arr2.indexOf(item) === -1;
            });
        },

        /**
         * 数组交集
         * @public
         * @param {Array} arr1 - 第一个数组
         * @param {Array} arr2 - 第二个数组
         * @returns {Array} 交集
         */
        intersection: function (arr1, arr2) {
            return arr1.filter(function (item) {
                return arr2.indexOf(item) !== -1;
            });
        },

        /**
         * 数组并集
         * @public
         * @param {Array} arr1 - 第一个数组
         * @param {Array} arr2 - 第二个数组
         * @returns {Array} 并集
         */
        union: function (arr1, arr2) {
            return this.unique(arr1.concat(arr2));
        },

        /**
         * 数组补集
         * @public
         * @param {Array} arr1 - 第一个数组
         * @param {Array} arr2 - 第二个数组
         * @returns {Array} 补集
         */
        symmetricDifference: function (arr1, arr2) {
            return this.difference(arr1, arr2).concat(this.difference(arr2, arr1));
        },

        /**
         * 数组排序
         * @public
         * @param {Array} arr - 数组
         * @param {Function} [compareFn] - 比较函数
         * @returns {Array} 排序后的数组
         */
        sort: function (arr, compareFn) {
            return arr.slice().sort(compareFn);
        },

        /**
         * 数组反转
         * @public
         * @param {Array} arr - 数组
         * @returns {Array} 反转后的数组
         */
        reverseArray: function (arr) {
            return arr.slice().reverse();
        },

        /**
         * 数组填充
         * @public
         * @param {Array} arr - 数组
         * @param {*} value - 填充值
         * @param {number} [start] - 起始位置
         * @param {number} [end] - 结束位置
         * @returns {Array} 填充后的数组
         */
        fill: function (arr, value, start, end) {
            return arr.slice().fill(value, start, end);
        },

        /**
         * 数组查找
         * @public
         * @param {Array} arr - 数组
         * @param {Function} predicate - 断言函数
         * @returns {*} 查找结果
         */
        find: function (arr, predicate) {
            for (var i = 0; i < arr.length; i++) {
                if (predicate(arr[i], i, arr)) {
                    return arr[i];
                }
            }
            return undefined;
        },

        /**
         * 数组查找索引
         * @public
         * @param {Array} arr - 数组
         * @param {Function} predicate - 断言函数
         * @returns {number} 索引
         */
        findIndex: function (arr, predicate) {
            for (var i = 0; i < arr.length; i++) {
                if (predicate(arr[i], i, arr)) {
                    return i;
                }
            }
            return -1;
        },

        /**
         * 数组包含
         * @public
         * @param {Array} arr - 数组
         * @param {*} value - 值
         * @returns {boolean} 是否包含
         */
        includes: function (arr, value) {
            return arr.indexOf(value) !== -1;
        },

        /**
         * 数组求和
         * @public
         * @param {Array} arr - 数组
         * @returns {number} 和
         */
        sum: function (arr) {
            return arr.reduce(function (a, b) {
                return a + b;
            }, 0);
        },

        /**
         * 数组求平均值
         * @public
         * @param {Array} arr - 数组
         * @returns {number} 平均值
         */
        average: function (arr) {
            return this.sum(arr) / arr.length;
        },

        /**
         * 数组求最大值
         * @public
         * @param {Array} arr - 数组
         * @returns {number} 最大值
         */
        max: function (arr) {
            return Math.max.apply(null, arr);
        },

        /**
         * 数组求最小值
         * @public
         * @param {Array} arr - 数组
         * @returns {number} 最小值
         */
        min: function (arr) {
            return Math.min.apply(null, arr);
        },

        /**
         * 数组求中位数
         * @public
         * @param {Array} arr - 数组
         * @returns {number} 中位数
         */
        median: function (arr) {
            var sorted = this.sort(arr);
            var mid = Math.floor(sorted.length / 2);
            return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
        },

        /**
         * 数组求众数
         * @public
         * @param {Array} arr - 数组
         * @returns {Array} 众数数组
         */
        mode: function (arr) {
            var counts = {};
            var maxCount = 0;
            for (var i = 0; i < arr.length; i++) {
                var num = arr[i];
                counts[num] = (counts[num] || 0) + 1;
                if (counts[num] > maxCount) {
                    maxCount = counts[num];
                }
            }
            var modes = [];
            for (var key in counts) {
                if (counts.hasOwnProperty(key) && counts[key] === maxCount) {
                    modes.push(Number(key));
                }
            }
            return modes;
        },

        /**
         * 数组求范围
         * @public
         * @param {Array} arr - 数组
         * @returns {number} 范围
         */
        range: function (arr) {
            return this.max(arr) - this.min(arr);
        },

        /**
         * 数组求方差
         * @public
         * @param {Array} arr - 数组
         * @returns {number} 方差
         */
        variance: function (arr) {
            var avg = this.average(arr);
            return this.sum(arr.map(function (num) {
                return Math.pow(num - avg, 2);
            })) / arr.length;
        },

        /**
         * 数组求标准差
         * @public
         * @param {Array} arr - 数组
         * @returns {number} 标准差
         */
        standardDeviation: function (arr) {
            return Math.sqrt(this.variance(arr));
        },

        /**
         * 数组求百分位数
         * @public
         * @param {Array} arr - 数组
         * @param {number} percentile - 百分位
         * @returns {number} 百分位数
         */
        percentile: function (arr, percentile) {
            var sorted = this.sort(arr);
            var index = (percentile / 100) * (sorted.length - 1);
            var lower = Math.floor(index);
            var upper = Math.ceil(index);
            var weight = index - lower;
            return sorted[lower] * (1 - weight) + sorted[upper] * weight;
        },

        /**
         * 数组求四分位数
         * @public
         * @param {Array} arr - 数组
         * @returns {Object} 四分位数
         */
        quartiles: function (arr) {
            return {
                q1: this.percentile(arr, 25),
                q2: this.percentile(arr, 50),
                q3: this.percentile(arr, 75)
            };
        },

        /**
         * 数组求四分位距
         * @public
         * @param {Array} arr - 数组
         * @returns {number} 四分位距
         */
        interquartileRange: function (arr) {
            var q = this.quartiles(arr);
            return q.q3 - q.q1;
        },

        /**
         * 数组求偏度
         * @public
         * @param {Array} arr - 数组
         * @returns {number} 偏度
         */
        skewness: function (arr) {
            var avg = this.average(arr);
            var n = arr.length;
            var sum1 = 0;
            var sum2 = 0;
            for (var i = 0; i < n; i++) {
                sum1 += Math.pow(arr[i] - avg, 3);
                sum2 += Math.pow(arr[i] - avg, 2);
            }
            return (sum1 / n) / Math.pow(sum2 / n, 1.5);
        },

        /**
         * 数组求峰度
         * @public
         * @param {Array} arr - 数组
         * @returns {number} 峰度
         */
        kurtosis: function (arr) {
            var avg = this.average(arr);
            var n = arr.length;
            var sum1 = 0;
            var sum2 = 0;
            for (var i = 0; i < n; i++) {
                sum1 += Math.pow(arr[i] - avg, 4);
                sum2 += Math.pow(arr[i] - avg, 2);
            }
            return (sum1 / n) / Math.pow(sum2 / n, 2) - 3;
        },

        /**
         * 数组求协方差
         * @public
         * @param {Array} arr1 - 第一个数组
         * @param {Array} arr2 - 第二个数组
         * @returns {number} 协方差
         */
        covariance: function (arr1, arr2) {
            var avg1 = this.average(arr1);
            var avg2 = this.average(arr2);
            var sum = 0;
            for (var i = 0; i < arr1.length; i++) {
                sum += (arr1[i] - avg1) * (arr2[i] - avg2);
            }
            return sum / arr1.length;
        },

        /**
         * 数组求相关系数
         * @public
         * @param {Array} arr1 - 第一个数组
         * @param {Array} arr2 - 第二个数组
         * @returns {number} 相关系数
         */
        correlation: function (arr1, arr2) {
            return this.covariance(arr1, arr2) / (this.standardDeviation(arr1) * this.standardDeviation(arr2));
        },

        /**
         * 数组求线性回归
         * @public
         * @param {Array} x - X数组
         * @param {Array} y - Y数组
         * @returns {Object} 线性回归结果
         */
        linearRegression: function (x, y) {
            var n = x.length;
            var sumX = this.sum(x);
            var sumY = this.sum(y);
            var sumXY = 0;
            var sumXX = 0;
            for (var i = 0; i < n; i++) {
                sumXY += x[i] * y[i];
                sumXX += x[i] * x[i];
            }
            var slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
            var intercept = (sumY - slope * sumX) / n;
            return {
                slope: slope,
                intercept: intercept,
                predict: function (x) {
                    return slope * x + intercept;
                }
            };
        },

        /**
         * 数组求移动平均
         * @public
         * @param {Array} arr - 数组
         * @param {number} window - 窗口大小
         * @returns {Array} 移动平均数组
         */
        movingAverage: function (arr, window) {
            var result = [];
            for (var i = 0; i <= arr.length - window; i++) {
                result.push(this.average(arr.slice(i, i + window)));
            }
            return result;
        },

        /**
         * 数组求指数移动平均
         * @public
         * @param {Array} arr - 数组
         * @param {number} alpha - 平滑系数
         * @returns {Array} 指数移动平均数组
         */
        exponentialMovingAverage: function (arr, alpha) {
            var result = [arr[0]];
            for (var i = 1; i < arr.length; i++) {
                result.push(alpha * arr[i] + (1 - alpha) * result[i - 1]);
            }
            return result;
        },

        /**
         * 数组求累积和
         * @public
         * @param {Array} arr - 数组
         * @returns {Array} 累积和数组
         */
        cumulativeSum: function (arr) {
            var result = [];
            var sum = 0;
            for (var i = 0; i < arr.length; i++) {
                sum += arr[i];
                result.push(sum);
            }
            return result;
        },

        /**
         * 数组求累积积
         * @public
         * @param {Array} arr - 数组
         * @returns {Array} 累积积数组
         */
        cumulativeProduct: function (arr) {
            var result = [];
            var product = 1;
            for (var i = 0; i < arr.length; i++) {
                product *= arr[i];
                result.push(product);
            }
            return result;
        },

        /**
         * 数组求差分
         * @public
         * @param {Array} arr - 数组
         * @returns {Array} 差分数组
         */
        diff: function (arr) {
            var result = [];
            for (var i = 1; i < arr.length; i++) {
                result.push(arr[i] - arr[i - 1]);
            }
            return result;
        },

        /**
         * 数组求累积最大值
         * @public
         * @param {Array} arr - 数组
         * @returns {Array} 累积最大值数组
         */
        cumulativeMax: function (arr) {
            var result = [];
            var max = arr[0];
            for (var i = 0; i < arr.length; i++) {
                if (arr[i] > max) {
                    max = arr[i];
                }
                result.push(max);
            }
            return result;
        },

        /**
         * 数组求累积最小值
         * @public
         * @param {Array} arr - 数组
         * @returns {Array} 累积最小值数组
         */
        cumulativeMin: function (arr) {
            var result = [];
            var min = arr[0];
            for (var i = 0; i < arr.length; i++) {
                if (arr[i] < min) {
                    min = arr[i];
                }
                result.push(min);
            }
            return result;
        },

        /**
         * 数组求运行和
         * @public
         * @param {Array} arr - 数组
         * @param {number} window - 窗口大小
         * @returns {Array} 运行和数组
         */
        runningSum: function (arr, window) {
            var result = [];
            for (var i = 0; i <= arr.length - window; i++) {
                result.push(this.sum(arr.slice(i, i + window)));
            }
            return result;
        },

        /**
         * 数组求运行平均
         * @public
         * @param {Array} arr - 数组
         * @param {number} window - 窗口大小
         * @returns {Array} 运行平均数组
         */
        runningAverage: function (arr, window) {
            var result = [];
            for (var i = 0; i <= arr.length - window; i++) {
                result.push(this.average(arr.slice(i, i + window)));
            }
            return result;
        },

        /**
         * 数组求运行最大值
         * @public
         * @param {Array} arr - 数组
         * @param {number} window - 窗口大小
         * @returns {Array} 运行最大值数组
         */
        runningMax: function (arr, window) {
            var result = [];
            for (var i = 0; i <= arr.length - window; i++) {
                result.push(this.max(arr.slice(i, i + window)));
            }
            return result;
        },

        /**
         * 数组求运行最小值
         * @public
         * @param {Array} arr - 数组
         * @param {number} window - 窗口大小
         * @returns {Array} 运行最小值数组
         */
        runningMin: function (arr, window) {
            var result = [];
            for (var i = 0; i <= arr.length - window; i++) {
                result.push(this.min(arr.slice(i, i + window)));
            }
            return result;
        },

        /**
         * 数组求运行标准差
         * @public
         * @param {Array} arr - 数组
         * @param {number} window - 窗口大小
         * @returns {Array} 运行标准差数组
         */
        runningStandardDeviation: function (arr, window) {
            var result = [];
            for (var i = 0; i <= arr.length - window; i++) {
                result.push(this.standardDeviation(arr.slice(i, i + window)));
            }
            return result;
        },

        /**
         * 数组求运行方差
         * @public
         * @param {Array} arr - 数组
         * @param {number} window - 窗口大小
         * @returns {Array} 运行方差数组
         */
        runningVariance: function (arr, window) {
            var result = [];
            for (var i = 0; i <= arr.length - window; i++) {
                result.push(this.variance(arr.slice(i, i + window)));
            }
            return result;
        },

        /**
         * 数组求运行中位数
         * @public
         * @param {Array} arr - 数组
         * @param {number} window - 窗口大小
         * @returns {Array} 运行中位数数组
         */
        runningMedian: function (arr, window) {
            var result = [];
            for (var i = 0; i <= arr.length - window; i++) {
                result.push(this.median(arr.slice(i, i + window)));
            }
            return result;
        },

        /**
         * 数组求运行百分位数
         * @public
         * @param {Array} arr - 数组
         * @param {number} window - 窗口大小
         * @param {number} percentile - 百分位
         * @returns {Array} 运行百分位数数组
         */
        runningPercentile: function (arr, window, percentile) {
            var result = [];
            for (var i = 0; i <= arr.length - window; i++) {
                result.push(this.percentile(arr.slice(i, i + window), percentile));
            }
            return result;
        },

        /**
         * 数组求运行四分位数
         * @public
         * @param {Array} arr - 数组
         * @param {number} window - 窗口大小
         * @returns {Array} 运行四分位数数组
         */
        runningQuartiles: function (arr, window) {
            var result = [];
            for (var i = 0; i <= arr.length - window; i++) {
                result.push(this.quartiles(arr.slice(i, i + window)));
            }
            return result;
        },

        /**
         * 数组求运行四分位距
         * @public
         * @param {Array} arr - 数组
         * @param {number} window - 窗口大小
         * @returns {Array} 运行四分位距数组
         */
        runningInterquartileRange: function (arr, window) {
            var result = [];
            for (var i = 0; i <= arr.length - window; i++) {
                result.push(this.interquartileRange(arr.slice(i, i + window)));
            }
            return result;
        },

        /**
         * 数组求运行偏度
         * @public
         * @param {Array} arr - 数组
         * @param {number} window - 窗口大小
         * @returns {Array} 运行偏度数组
         */
        runningSkewness: function (arr, window) {
            var result = [];
            for (var i = 0; i <= arr.length - window; i++) {
                result.push(this.skewness(arr.slice(i, i + window)));
            }
            return result;
        },

        /**
         * 数组求运行峰度
         * @public
         * @param {Array} arr - 数组
         * @param {number} window - 窗口大小
         * @returns {Array} 运行峰度数组
         */
        runningKurtosis: function (arr, window) {
            var result = [];
            for (var i = 0; i <= arr.length - window; i++) {
                result.push(this.kurtosis(arr.slice(i, i + window)));
            }
            return result;
        },

        /**
         * 数组求运行协方差
         * @public
         * @param {Array} arr1 - 第一个数组
         * @param {Array} arr2 - 第二个数组
         * @param {number} window - 窗口大小
         * @returns {Array} 运行协方差数组
         */
        runningCovariance: function (arr1, arr2, window) {
            var result = [];
            for (var i = 0; i <= arr1.length - window; i++) {
                result.push(this.covariance(arr1.slice(i, i + window), arr2.slice(i, i + window)));
            }
            return result;
        },

        /**
         * 数组求运行相关系数
         * @public
         * @param {Array} arr1 - 第一个数组
         * @param {Array} arr2 - 第二个数组
         * @param {number} window - 窗口大小
         * @returns {Array} 运行相关系数数组
         */
        runningCorrelation: function (arr1, arr2, window) {
            var result = [];
            for (var i = 0; i <= arr1.length - window; i++) {
                result.push(this.correlation(arr1.slice(i, i + window), arr2.slice(i, i + window)));
            }
            return result;
        },

        /**
         * 数组求运行线性回归
         * @public
         * @param {Array} x - X数组
         * @param {Array} y - Y数组
         * @param {number} window - 窗口大小
         * @returns {Array} 运行线性回归数组
         */
        runningLinearRegression: function (x, y, window) {
            var result = [];
            for (var i = 0; i <= x.length - window; i++) {
                result.push(this.linearRegression(x.slice(i, i + window), y.slice(i, i + window)));
            }
            return result;
        },

        /**
         * 数组求运行移动平均
         * @public
         * @param {Array} arr - 数组
         * @param {number} window - 窗口大小
         * @returns {Array} 运行移动平均数组
         */
        runningMovingAverage: function (arr, window) {
            var result = [];
            for (var i = 0; i <= arr.length - window; i++) {
                result.push(this.movingAverage(arr.slice(i, i + window), window));
            }
            return result;
        },

        /**
         * 数组求运行指数移动平均
         * @public
         * @param {Array} arr - 数组
         * @param {number} window - 窗口大小
         * @param {number} alpha - 平滑系数
         * @returns {Array} 运行指数移动平均数组
         */
        runningExponentialMovingAverage: function (arr, window, alpha) {
            var result = [];
            for (var i = 0; i <= arr.length - window; i++) {
                result.push(this.exponentialMovingAverage(arr.slice(i, i + window), alpha));
            }
            return result;
        },

        /**
         * 数组求运行累积和
         * @public
         * @param {Array} arr - 数组
         * @param {number} window - 窗口大小
         * @returns {Array} 运行累积和数组
         */
        runningCumulativeSum: function (arr, window) {
            var result = [];
            for (var i = 0; i <= arr.length - window; i++) {
                result.push(this.cumulativeSum(arr.slice(i, i + window)));
            }
            return result;
        },

        /**
         * 数组求运行累积积
         * @public
         * @param {Array} arr - 数组
         * @param {number} window - 窗口大小
         * @returns {Array} 运行累积积数组
         */
        runningCumulativeProduct: function (arr, window) {
            var result = [];
            for (var i = 0; i <= arr.length - window; i++) {
                result.push(this.cumulativeProduct(arr.slice(i, i + window)));
            }
            return result;
        },

        /**
         * 数组求运行差分
         * @public
         * @param {Array} arr - 数组
         * @param {number} window - 窗口大小
         * @returns {Array} 运行差分数组
         */
        runningDifference: function (arr, window) {
            var result = [];
            for (var i = 0; i <= arr.length - window; i++) {
                result.push(this.diff(arr.slice(i, i + window)));
            }
            return result;
        },

        /**
         * 数组求运行累积最大值
         * @public
         * @param {Array} arr - 数组
         * @param {number} window - 窗口大小
         * @returns {Array} 运行累积最大值数组
         */
        runningCumulativeMax: function (arr, window) {
            var result = [];
            for (var i = 0; i <= arr.length - window; i++) {
                result.push(this.cumulativeMax(arr.slice(i, i + window)));
            }
            return result;
        },

        /**
         * 数组求运行累积最小值
         * @public
         * @param {Array} arr - 数组
         * @param {number} window - 窗口大小
         * @returns {Array} 运行累积最小值数组
         */
        runningCumulativeMin: function (arr, window) {
            var result = [];
            for (var i = 0; i <= arr.length - window; i++) {
                result.push(this.cumulativeMin(arr.slice(i, i + window)));
            }
            return result;
        },

        /**
         * 数组求运行运行和
         * @public
         * @param {Array} arr - 数组
         * @param {number} window - 窗口大小
         * @returns {Array} 运行运行和数组
         */
        runningRunningSum: function (arr, window) {
            var result = [];
            for (var i = 0; i <= arr.length - window; i++) {
                result.push(this.runningSum(arr.slice(i, i + window), window));
            }
            return result;
        },

        /**
         * 数组求运行运行平均
         * @public
         * @param {Array} arr - 数组
         * @param {number} window - 窗口大小
         * @returns {Array} 运行运行平均数组
         */
        runningRunningAverage: function (arr, window) {
            var result = [];
            for (var i = 0; i <= arr.length - window; i++) {
                result.push(this.runningAverage(arr.slice(i, i + window), window));
            }
            return result;
        },

        /**
         * 数组求运行运行最大值
         * @public
         * @param {Array} arr - 数组
         * @param {number} window - 窗口大小
         * @returns {Array} 运行运行最大值数组
         */
        runningRunningMax: function (arr, window) {
            var result = [];
            for (var i = 0; i <= arr.length - window; i++) {
                result.push(this.runningMax(arr.slice(i, i + window), window));
            }
            return result;
        },

        /**
         * 数组求运行运行最小值
         * @public
         * @param {Array} arr - 数组
         * @param {number} window - 窗口大小
         * @returns {Array} 运行运行最小值数组
         */
        runningRunningMin: function (arr, window) {
            var result = [];
            for (var i = 0; i <= arr.length - window; i++) {
                result.push(this.runningMin(arr.slice(i, i + window), window));
            }
            return result;
        },

        /**
         * 数组求运行运行标准差
         * @public
         * @param {Array} arr - 数组
         * @param {number} window - 窗口大小
         * @returns {Array} 运行运行标准差数组
         */
        runningRunningStandardDeviation: function (arr, window) {
            var result = [];
            for (var i = 0; i <= arr.length - window; i++) {
                result.push(this.runningStandardDeviation(arr.slice(i, i + window), window));
            }
            return result;
        },

        /**
         * 数组求运行运行方差
         * @public
         * @param {Array} arr - 数组
         * @param {number} window - 窗口大小
         * @returns {Array} 运行运行方差数组
         */
        runningRunningVariance: function (arr, window) {
            var result = [];
            for (var i = 0; i <= arr.length - window; i++) {
                result.push(this.runningVariance(arr.slice(i, i + window), window));
            }
            return result;
        },

        /**
         * 数组求运行运行中位数
         * @public
         * @param {Array} arr - 数组
         * @param {number} window - 窗口大小
         * @returns {Array} 运行运行中位数数组
         */
        runningRunningMedian: function (arr, window) {
            var result = [];
            for (var i = 0; i <= arr.length - window; i++) {
                result.push(this.runningMedian(arr.slice(i, i + window), window));
            }
            return result;
        },

        /**
         * 数组求运行运行百分位数
         * @public
         * @param {Array} arr - 数组
         * @param {number} window - 窗口大小
         * @param {number} percentile - 百分位
         * @returns {Array} 运行运行百分位数数组
         */
        runningRunningPercentile: function (arr, window, percentile) {
            var result = [];
            for (var i = 0; i <= arr.length - window; i++) {
                result.push(this.runningPercentile(arr.slice(i, i + window), window, percentile));
            }
            return result;
        },

        /**
         * 数组求运行运行四分位数
         * @public
         * @param {Array} arr - 数组
         * @param {number} window - 窗口大小
         * @returns {Array} 运行运行四分位数数组
         */
        runningRunningQuartiles: function (arr, window) {
            var result = [];
            for (var i = 0; i <= arr.length - window; i++) {
                result.push(this.runningQuartiles(arr.slice(i, i + window), window));
            }
            return result;
        },

        /**
         * 数组求运行运行四分位距
         * @public
         * @param {Array} arr - 数组
         * @param {number} window - 窗口大小
         * @returns {Array} 运行运行四分位距数组
         */
        runningRunningInterquartileRange: function (arr, window) {
            var result = [];
            for (var i = 0; i <= arr.length - window; i++) {
                result.push(this.runningInterquartileRange(arr.slice(i, i + window), window));
            }
            return result;
        },

        /**
         * 数组求运行运行偏度
         * @public
         * @param {Array} arr - 数组
         * @param {number} window - 窗口大小
         * @returns {Array} 运行运行偏度数组
         */
        runningRunningSkewness: function (arr, window) {
            var result = [];
            for (var i = 0; i <= arr.length - window; i++) {
                result.push(this.runningSkewness(arr.slice(i, i + window), window));
            }
            return result;
        },

        /**
         * 数组求运行运行峰度
         * @public
         * @param {Array} arr - 数组
         * @param {number} window - 窗口大小
         * @returns {Array} 运行运行峰度数组
         */
        runningRunningKurtosis: function (arr, window) {
            var result = [];
            for (var i = 0; i <= arr.length - window; i++) {
                result.push(this.runningKurtosis(arr.slice(i, i + window), window));
            }
            return result;
        },

        /**
         * 数组求运行运行协方差
         * @public
         * @param {Array} arr1 - 第一个数组
         * @param {Array} arr2 - 第二个数组
         * @param {number} window - 窗口大小
         * @returns {Array} 运行运行协方差数组
         */
        runningRunningCovariance: function (arr1, arr2, window) {
            var result = [];
            for (var i = 0; i <= arr1.length - window; i++) {
                result.push(this.runningCovariance(arr1.slice(i, i + window), arr2.slice(i, i + window), window));
            }
            return result;
        },

        /**
         * 数组求运行运行相关系数
         * @public
         * @param {Array} arr1 - 第一个数组
         * @param {Array} arr2 - 第二个数组
         * @param {number} window - 窗口大小
         * @returns {Array} 运行运行相关系数数组
         */
        runningRunningCorrelation: function (arr1, arr2, window) {
            var result = [];
            for (var i = 0; i <= arr1.length - window; i++) {
                result.push(this.runningCorrelation(arr1.slice(i, i + window), arr2.slice(i, i + window), window));
            }
            return result;
        },

        /**
         * 数组求运行运行线性回归
         * @public
         * @param {Array} x - X数组
         * @param {Array} y - Y数组
         * @param {number} window - 窗口大小
         * @returns {Array} 运行运行线性回归数组
         */
        runningRunningLinearRegression: function (x, y, window) {
            var result = [];
            for (var i = 0; i <= x.length - window; i++) {
                result.push(this.runningLinearRegression(x.slice(i, i + window), y.slice(i, i + window), window));
            }
            return result;
        },

        /**
         * 数组求运行运行移动平均
         * @public
         * @param {Array} arr - 数组
         * @param {number} window - 窗口大小
         * @returns {Array} 运行运行移动平均数组
         */
        runningRunningMovingAverage: function (arr, window) {
            var result = [];
            for (var i = 0; i <= arr.length - window; i++) {
                result.push(this.runningMovingAverage(arr.slice(i, i + window), window));
            }
            return result;
        },

        /**
         * 数组求运行运行指数移动平均
         * @public
         * @param {Array} arr - 数组
         * @param {number} window - 窗口大小
         * @param {number} alpha - 平滑系数
         * @returns {Array} 运行运行指数移动平均数组
         */
        runningRunningExponentialMovingAverage: function (arr, window, alpha) {
            var result = [];
            for (var i = 0; i <= arr.length - window; i++) {
                result.push(this.runningExponentialMovingAverage(arr.slice(i, i + window), window, alpha));
            }
            return result;
        },

        /**
         * 数组求运行运行累积和
         * @public
         * @param {Array} arr - 数组
         * @param {number} window - 窗口大小
         * @returns {Array} 运行运行累积和数组
         */
        runningRunningCumulativeSum: function (arr, window) {
            var result = [];
            for (var i = 0; i <= arr.length - window; i++) {
                result.push(this.runningCumulativeSum(arr.slice(i, i + window), window));
            }
            return result;
        },

        /**
         * 数组求运行运行累积积
         * @public
         * @param {Array} arr - 数组
         * @param {number} window - 窗口大小
         * @returns {Array} 运行运行累积积数组
         */
        runningRunningCumulativeProduct: function (arr, window) {
            var result = [];
            for (var i = 0; i <= arr.length - window; i++) {
                result.push(this.runningCumulativeProduct(arr.slice(i, i + window), window));
            }
            return result;
        },

        /**
         * 数组求运行运行差分
         * @public
         * @param {Array} arr - 数组
         * @param {number} window - 窗口大小
         * @returns {Array} 运行运行差分数组
         */
        runningRunningDifference: function (arr, window) {
            var result = [];
            for (var i = 0; i <= arr.length - window; i++) {
                result.push(this.runningDifference(arr.slice(i, i + window), window));
            }
            return result;
        },

        /**
         * 数组求运行运行累积最大值
         * @public
         * @param {Array} arr - 数组
         * @param {number} window - 窗口大小
         * @returns {Array} 运行运行累积最大值数组
         */
        runningRunningCumulativeMax: function (arr, window) {
            var result = [];
            for (var i = 0; i <= arr.length - window; i++) {
                result.push(this.runningCumulativeMax(arr.slice(i, i + window), window));
            }
            return result;
        },

        /**
         * 数组求运行运行累积最小值
         * @public
         * @param {Array} arr - 数组
         * @param {number} window - 窗口大小
         * @returns {Array} 运行运行累积最小值数组
         */
        runningRunningCumulativeMin: function (arr, window) {
            var result = [];
            for (var i = 0; i <= arr.length - window; i++) {
                result.push(this.runningCumulativeMin(arr.slice(i, i + window), window));
            }
            return result;
        },

        /**
         * 数组求运行运行运行和
         * @public
         * @param {Array} arr - 数组
         * @param {number} window - 窗口大小
         * @returns {Array} 运行运行运行和数组
         */
        runningRunningRunningSum: function (arr, window) {
            var result = [];
            for (var i = 0; i <= arr.length - window; i++) {
                result.push(this.runningRunningSum(arr.slice(i, i + window), window));
            }
            return result;
        },

        /**
         * 数组求运行运行运行平均
         * @public
         * @param {Array} arr - 数组
         * @param {number} window - 窗口大小
         * @returns {Array} 运行运行运行平均数组
         */
        runningRunningRunningAverage: function (arr, window) {
            var result = [];
            for (var i = 0; i <= arr.length - window; i++) {
                result.push(this.runningRunningAverage(arr.slice(i, i + window), window));
            }
            return result;
        },

        /**
         * 数组求运行运行运行最大值
         * @public
         * @param {Array} arr - 数组
         * @param {number} window - 窗口大小
         * @returns {Array} 运行运行运行最大值数组
         */
        runningRunningRunningMax: function (arr, window) {
            var result = [];
            for (var i = 0; i <= arr.length - window; i++) {
                result.push(this.runningRunningMax(arr.slice(i, i + window), window));
            }
            return result;
        },

        /**
         * 数组求运行运行运行最小值
         * @public
         * @param {Array} arr - 数组
         * @param {number} window - 窗口大小
         * @returns {Array} 运行运行运行最小值数组
         */
        runningRunningRunningMin: function (arr, window) {
            var result = [];
            for (var i = 0; i <= arr.length - window; i++) {
                result.push(this.runningRunningMin(arr.slice(i, i + window), window));
            }
            return result;
        },

        /**
         * 数组求运行运行运行标准差
         * @public
         * @param {Array} arr - 数组
         * @param {number} window - 窗口大小
         * @returns {Array} 运行运行运行标准差数组
         */
        runningRunningRunningStandardDeviation: function (arr, window) {
            var result = [];
            for (var i = 0; i <= arr.length - window; i++) {
                result.push(this.runningRunningStandardDeviation(arr.slice(i, i + window), window));
            }
            return result;
        },

        /**
         * 数组求运行运行运行方差
         * @public
         * @param {Array} arr - 数组
         * @param {number} window - 窗口大小
         * @returns {Array} 运行运行运行方差数组
         */
        runningRunningRunningVariance: function (arr, window) {
            var result = [];
            for (var i = 0; i <= arr.length - window; i++) {
                result.push(this.runningRunningVariance(arr.slice(i, i + window), window));
            }
            return result;
        },

        /**
         * 数组求运行运行运行中位数
         * @public
         * @param {Array} arr - 数组
         * @param {number} window - 窗口大小
         * @returns {Array} 运行运行运行中位数数组
         */
        runningRunningRunningMedian: function (arr, window) {
            var result = [];
            for (var i = 0; i <= arr.length - window; i++) {
                result.push(this.runningRunningMedian(arr.slice(i, i + window), window));
            }
            return result;
        },

        /**
         * 数组求运行运行运行百分位数
         * @public
         * @param {Array} arr - 数组
         * @param {number} window - 窗口大小
         * @param {number} percentile - 百分位
         * @returns {Array} 运行运行运行百分位数数组
         */
        runningRunningRunningPercentile: function (arr, window, percentile) {
            var result = [];
            for (var i = 0; i <= arr.length - window; i++) {
                result.push(this.runningRunningPercentile(arr.slice(i, i + window), window, percentile));
            }
            return result;
        },

        /**
         * 数组求运行运行运行四分位数
         * @public
         * @param {Array} arr - 数组
         * @param {number} window - 窗口大小
         * @returns {Array} 运行运行运行四分位数数组
         */
        runningRunningRunningQuartiles: function (arr, window) {
            var result = [];
            for (var i = 0; i <= arr.length - window; i++) {
                result.push(this.runningRunningQuartiles(arr.slice(i, i + window), window));
            }
            return result;
        },

        /**
         * 数组求运行运行运行四分位距
         * @public
         * @param {Array} arr - 数组
         * @param {number} window - 窗口大小
         * @returns {Array} 运行运行运行四分位距数组
         */
        runningRunningRunningInterquartileRange: function (arr, window) {
            var result = [];
            for (var i = 0; i <= arr.length - window; i++) {
                result.push(this.runningRunningInterquartileRange(arr.slice(i, i + window), window));
            }
            return result;
        },

        /**
         * 数组求运行运行运行偏度
         * @public
         * @param {Array} arr - 数组
         * @param {number} window - 窗口大小
         * @returns {Array} 运行运行运行偏度数组
         */
        runningRunningRunningSkewness: function (arr, window) {
            var result = [];
            for (var i = 0; i <= arr.length - window; i++) {
                result.push(this.runningRunningSkewness(arr.slice(i, i + window), window));
            }
            return result;
        },

        /**
         * 数组求运行运行运行峰度
         * @public
         * @param {Array} arr - 数组
         * @param {number} window - 窗口大小
         * @returns {Array} 运行运行运行峰度数组
         */
        runningRunningRunningKurtosis: function (arr, window) {
            var result = [];
            for (var i = 0; i <= arr.length - window; i++) {
                result.push(this.runningRunningKurtosis(arr.slice(i, i + window), window));
            }
            return result;
        },

        /**
         * 数组求运行运行运行协方差
         * @public
         * @param {Array} arr1 - 第一个数组
         * @param {Array} arr2 - 第二个数组
         * @param {number} window - 窗口大小
         * @returns {Array} 运行运行运行协方差数组
         */
        runningRunningRunningCovariance: function (arr1, arr2, window) {
            var result = [];
            for (var i = 0; i <= arr1.length - window; i++) {
                result.push(this.runningRunningCovariance(arr1.slice(i, i + window), arr2.slice(i, i + window), window));
            }
            return result;
        },

        /**
         * 数组求运行运行运行相关系数
         * @public
         * @param {Array} arr1 - 第一个数组
         * @param {Array} arr2 - 第二个数组
         * @param {number} window - 窗口大小
         * @returns {Array} 运行运行运行相关系数数组
         */
        runningRunningRunningCorrelation: function (arr1, arr2, window) {
            var result = [];
            for (var i = 0; i <= arr1.length - window; i++) {
                result.push(this.runningRunningCorrelation(arr1.slice(i, i + window), arr2.slice(i, i + window), window));
            }
            return result;
        },

        /**
         * 数组求运行运行运行线性回归
         * @public
         * @param {Array} x - X数组
         * @param {Array} y - Y数组
         * @param {number} window - 窗口大小
         * @returns {Array} 运行运行运行线性回归数组
         */
        runningRunningRunningLinearRegression: function (x, y, window) {
            var result = [];
            for (var i = 0; i <= x.length - window; i++) {
                result.push(this.runningRunningLinearRegression(x.slice(i, i + window), y.slice(i, i + window), window));
            }
            return result;
        },

        /**
         * 数组求运行运行运行移动平均
         * @public
         * @param {Array} arr - 数组
         * @param {number} window - 窗口大小
         * @returns {Array} 运行运行运行移动平均数组
         */
        runningRunningRunningMovingAverage: function (arr, window) {
            var result = [];
            for (var i = 0; i <= arr.length - window; i++) {
                result.push(this.runningRunningMovingAverage(arr.slice(i, i + window), window));
            }
            return result;
        },

        /**
         * 数组求运行运行运行指数移动平均
         * @public
         * @param {Array} arr - 数组
         * @param {number} window - 窗口大小
         * @param {number} alpha - 平滑系数
         * @returns {Array} 运行运行运行指数移动平均数组
         */
        runningRunningRunningExponentialMovingAverage: function (arr, window, alpha) {
            var result = [];
            for (var i = 0; i <= arr.length - window; i++) {
                result.push(this.runningRunningExponentialMovingAverage(arr.slice(i, i + window), window, alpha));
            }
            return result;
        },

        /**
         * 数组求运行运行运行累积和
         * @public
         * @param {Array} arr - 数组
         * @param {number} window - 窗口大小
         * @returns {Array} 运行运行运行累积和数组
         */
        runningRunningRunningCumulativeSum: function (arr, window) {
            var result = [];
            for (var i = 0; i <= arr.length - window; i++) {
                result.push(this.runningRunningCumulativeSum(arr.slice(i, i + window), window));
            }
            return result;
        },

        /**
         * 数组求运行运行运行累积积
         * @public
         * @param {Array} arr - 数组
         * @param {number} window - 窗口大小
         * @returns {Array} 运行运行运行累积积数组
         */
        runningRunningRunningCumulativeProduct: function (arr, window) {
            var result = [];
            for (var i = 0; i <= arr.length - window; i++) {
                result.push(this.runningRunningCumulativeProduct(arr.slice(i, i + window), window));
            }
            return result;
        },

        /**
         * 数组求运行运行运行差分
         * @public
         * @param {Array} arr - 数组
         * @param {number} window - 窗口大小
         * @returns {Array} 运行运行运行差分数组
         */
        runningRunningRunningDifference: function (arr, window) {
            var result = [];
            for (var i = 0; i <= arr.length - window; i++) {
                result.push(this.runningRunningDifference(arr.slice(i, i + window), window));
            }
            return result;
        },

        /**
         * 数组求运行运行运行累积最大值
         * @public
         * @param {Array} arr - 数组
         * @param {number} window - 窗口大小
         * @returns {Array} 运行运行运行累积最大值数组
         */
        runningRunningRunningCumulativeMax: function (arr, window) {
            var result = [];
            for (var i = 0; i <= arr.length - window; i++) {
                result.push(this.runningRunningCumulativeMax(arr.slice(i, i + window), window));
            }
            return result;
        },

        /**
         * 数组求运行运行运行累积最小值
         * @public
         * @param {Array} arr - 数组
         * @param {number} window - 窗口大小
         * @returns {Array} 运行运行运行累积最小值数组
         */
        runningRunningRunningCumulativeMin: function (arr, window) {
            var result = [];
            for (var i = 0; i <= arr.length - window; i++) {
                result.push(this.runningRunningCumulativeMin(arr.slice(i, i + window), window));
            }
            return result;
        },

        /**
         * 数组求运行运行运行运行和
         * @public
         * @param {Array} arr - 数组
         * @param {number} window - 窗口大小
         * @returns {Array} 运行运行运行运行和数组
         */
        runningRunningRunningRunningSum: function (arr, window) {
            var result = [];
            for (var i = 0; i <= arr.length - window; i++) {
                result.push(this.runningRunningRunningSum(arr.slice(i, i + window), window));
            }
            return result;
        },

        /**
         * 数组求运行运行运行运行平均
         * @public
         * @param {Array} arr - 数组
         * @param {number} window - 窗口大小
         * @returns {Array} 运行运行运行运行平均数组
         */
        runningRunningRunningRunningAverage: function (arr, window) {
            var result = [];
            for (var i = 0; i <= arr.length - window; i++) {
                result.push(this.runningRunningRunningAverage(arr.slice(i, i + window), window));
            }
            return result;
        },

        /**
         * 数组求运行运行运行运行最大值
         * @public
         * @param {Array} arr - 数组
         * @param {number} window - 窗口大小
         * @returns {Array} 运行运行运行运行最大值数组
         */
        runningRunningRunningRunningMax: function (arr, window) {
            var result = [];
            for (var i = 0; i <= arr.length - window; i++) {
                result.push(this.runningRunningRunningMax(arr.slice(i, i + window), window));
            }
            return result;
        },

        /**
         * 数组求运行运行运行运行最小值
         * @public
         * @param {Array} arr - 数组
         * @param {number} window - 窗口大小
         * @returns {Array} 运行运行运行运行最小值数组
         */
        runningRunningRunningRunningMin: function (arr, window) {
            var result = [];
            for (var i = 0; i <= arr.length - window; i++) {
                result.push(this.runningRunningRunningMin(arr.slice(i, i + window), window));
            }
            return result;
        },

        /**
         * 数组求运行运行运行运行标准差
         * @public
         * @param {Array} arr - 数组
         * @param {number} window - 窗口大小
         * @returns {Array} 运行运行运行运行标准差数组
         */
        runningRunningRunningRunningStandardDeviation: function (arr, window) {
            var result = [];
            for (var i = 0; i <= arr.length - window; i++) {
                result.push(this.runningRunningRunningStandardDeviation(arr.slice(i, i + window), window));
            }
            return result;
        },

        /**
         * 数组求运行运行运行运行方差
         * @public
         * @param {Array} arr - 数组
         * @param {number} window - 窗口大小
         * @returns {Array} 运行运行运行运行方差数组
         */
        runningRunningRunningRunningVariance: function (arr, window) {
            var result = [];
            for (var i = 0; i <= arr.length - window; i++) {
                result.push(this.runningRunningRunningVariance(arr.slice(i, i + window), window));
            }
            return result;
        },

        /**
         * 数组求运行运行运行运行中位数
         * @public
         * @param {Array} arr - 数组
         * @param {number} window - 窗口大小
         * @returns {Array} 运行运行运行运行中位数数组
         */
        runningRunningRunningRunningMedian: function (arr, window) {
            var result = [];
            for (var i = 0; i <= arr.length - window; i++) {
                result.push(this.runningRunningRunningMedian(arr.slice(i, i + window), window));
            }
            return result;
        },

        /**
         * 数组求运行运行运行运行百分位数
         * @public
         * @param {Array} arr - 数组
         * @param {number} window - 窗口大小
         * @param {number} percentile - 百分位
         * @returns {Array} 运行运行运行运行百分位数数组
         */
        runningRunningRunningRunningPercentile: function (arr, window, percentile) {
            var result = [];
            for (var i = 0; i <= arr.length - window; i++) {
                result.push(this.runningRunningRunningPercentile(arr.slice(i, i + window), window, percentile));
            }
            return result;
        },

        /**
         * 数组求运行运行运行运行四分位数
         * @public
         * @param {Array} arr - 数组
         * @param {number} window - 窗口大小
         * @returns {Array} 运行运行运行运行四分位数数组
         */
        runningRunningRunningRunningQuartiles: function (arr, window) {
            var result = [];
            for (var i = 0; i <= arr.length - window; i++) {
                result.push(this.runningRunningRunningQuartiles(arr.slice(i, i + window), window));
            }
            return result;
        },

        /**
         * 数组求运行运行运行运行四分位距
         * @public
         * @param {Array} arr - 数组
         * @param {number} window - 窗口大小
         * @returns {Array} 运行运行运行运行四分位距数组
         */
        runningRunningRunningRunningInterquartileRange: function (arr, window) {
            var result = [];
            for (var i = 0; i <= arr.length - window; i++) {
                result.push(this.runningRunningRunningInterquartileRange(arr.slice(i, i + window), window));
            }
            return result;
        },

        /**
         * 数组求运行运行运行运行偏度
         * @public
         * @param {Array} arr - 数组
         * @param {number} window - 窗口大小
         * @returns {Array} 运行运行运行运行偏度数组
         */
        runningRunningRunningRunningSkewness: function (arr, window) {
            var result = [];
            for (var i = 0; i <= arr.length - window; i++) {
                result.push(this.runningRunningRunningSkewness(arr.slice(i, i + window), window));
            }
            return result;
        },

        /**
         * 数组求运行运行运行运行峰度
         * @public
         * @param {Array} arr - 数组
         * @param {number} window - 窗口大小
         * @returns {Array} 运行运行运行运行峰度数组
         */
        runningRunningRunningRunningKurtosis: function (arr, window) {
            var result = [];
            for (var i = 0; i <= arr.length - window; i++) {
                result.push(this.runningRunningRunningKurtosis(arr.slice(i, i + window), window));
            }
            return result;
        },

        /**
         * 数组求运行运行运行运行协方差
         * @public
         * @param {Array} arr1 - 第一个数组
         * @param {Array} arr2 - 第二个数组
         * @param {number} window - 窗口大小
         * @returns {Array} 运行运行运行运行协方差数组
         */
        runningRunningRunningRunningCovariance: function (arr1, arr2, window) {
            var result = [];
            for (var i = 0; i <= arr1.length - window; i++) {
                result.push(this.runningRunningRunningCovariance(arr1.slice(i, i + window), arr2.slice(i, i + window), window));
            }
            return result;
        },

        /**
         * 数组求运行运行运行运行相关系数
         * @public
         * @param {Array} arr1 - 第一个数组
         * @param {Array} arr2 - 第二个数组
         * @param {number} window - 窗口大小
         * @returns {Array} 运行运行运行运行相关系数数组
         */
        runningRunningRunningRunningCorrelation: function (arr1, arr2, window) {
            var result = [];
            for (var i = 0; i <= arr1.length - window; i++) {
                result.push(this.runningRunningRunningCorrelation(arr1.slice(i, i + window), arr2.slice(i, i + window), window));
            }
            return result;
        },

        /**
         * 数组求运行运行运行运行线性回归
         * @public
         * @param {Array} x - X数组
         * @param {Array} y - Y数组
         * @param {number} window - 窗口大小
         * @returns {Array} 运行运行运行运行线性回归数组
         */
        runningRunningRunningRunningLinearRegression: function (x, y, window) {
            var result = [];
            for (var i = 0; i <= x.length - window; i++) {
                result.push(this.runningRunningRunningLinearRegression(x.slice(i, i + window), y.slice(i, i + window), window));
            }
            return result;
        },

        /**
         * 数组求运行运行运行运行移动平均
         * @public
         * @param {Array} arr - 数组
         * @param {number} window - 窗口大小
         * @returns {Array} 运行运行运行运行移动平均数组
         */
        runningRunningRunningRunningMovingAverage: function (arr, window) {
            var result = [];
            for (var i = 0; i <= arr.length - window; i++) {
                result.push(this.runningRunningRunningMovingAverage(arr.slice(i, i + window), window));
            }
            return result;
        },

        /**
         * 数组求运行运行运行运行指数移动平均
         * @public
         * @param {Array} arr - 数组
         * @param {number} window - 窗口大小
         * @param {number} alpha - 平滑系数
         * @returns {Array} 运行运行运行运行指数移动平均数组
         */
        runningRunningRunningRunningExponentialMovingAverage: function (arr, window, alpha) {
            var result = [];
            for (var i = 0; i <= arr.length - window; i++) {
                result.push(this.runningRunningRunningExponentialMovingAverage(arr.slice(i, i + window), window, alpha));
            }
            return result;
        },

        /**
         * 数组求运行运行运行运行累积和
         * @public
         * @param {Array} arr - 数组
         * @param {number} window - 窗口大小
         * @returns {Array} 运行运行运行运行累积和数组
         */
        runningRunningRunningRunningCumulativeSum: function (arr, window) {
            var result = [];
            for (var i = 0; i <= arr.length - window; i++) {
                result.push(this.runningRunningRunningCumulativeSum(arr.slice(i, i + window), window));
            }
            return result;
        },

        /**
         * 数组求运行运行运行运行累积积
         * @public
         * @param {Array} arr - 数组
         * @param {number} window - 窗口大小
         * @returns {Array} 运行运行运行运行累积积数组
         */
        runningRunningRunningRunningCumulativeProduct: function (arr, window) {
            var result = [];
            for (var i = 0; i <= arr.length - window; i++) {
                result.push(this.runningRunningRunningCumulativeProduct(arr.slice(i, i + window), window));
            }
            return result;
        },

        /**
         * 数组求运行运行运行运行差分
         * @public
         * @param {Array} arr - 数组
         * @param {number} window - 窗口大小
         * @returns {Array} 运行运行运行运行差分数组
         */
        runningRunningRunningRunningDifference: function (arr, window) {
            var result = [];
            for (var i = 0; i <= arr.length - window; i++) {
                result.push(this.runningRunningRunningDifference(arr.slice(i, i + window), window));
            }
            return result;
        },

        /**
         * 数组求运行运行运行运行累积最大值
         * @public
         * @param {Array} arr - 数组
         * @param {number} window - 窗口大小
         * @returns {Array} 运行运行运行运行累积最大值数组
         */
        runningRunningRunningRunningCumulativeMax: function (arr, window) {
            var result = [];
            for (var i = 0; i <= arr.length - window; i++) {
                result.push(this.runningRunningRunningCumulativeMax(arr.slice(i, i + window), window));
            }
            return result;
        },

        /**
         * 数组求运行运行运行运行累积最小值
         * @public
         * @param {Array} arr - 数组
         * @param {number} window - 窗口大小
         * @returns {Array} 运行运行运行运行累积最小值数组
         */
        runningRunningRunningRunningCumulativeMin: function (arr, window) {
            var result = [];
            for (var i = 0; i <= arr.length - window; i++) {
                result.push(this.runningRunningRunningCumulativeMin(arr.slice(i, i + window), window));
            }
            return result;
        }
    };
}(window.$e = window.$e || {}));