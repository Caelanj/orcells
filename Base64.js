Base64 = {
  encode: (input) => {
    let string = "";
    input.match(/.{1,6}/g).forEach((item) => {
      string +=
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789._-".charAt(
          parseInt(item, 2)
        );
    });
    return string;
  },
  decode: (input) => {
    let string = "";
    input.split("").forEach((item) => {
      let value = String(
        decimalToBinary(
          "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789._-".indexOf(
            item
          )
        )
      );
      string += "0".repeat(6 - value.length) + value;
    });
    return string;
  },
};

//syntax highlighting may fail/break up in the following:

// A = "0"; 000000
// B = "1"; 000001
// C = "2"; 000010
// D = "3"; 000011
// E = "4"; 000100
// F = "5"; 000101
// G = "6"; 000110
// H = "7"; 000111
// I = "8"; 001000
// J = "9"; 001001
// K = "10"; 001010
// L = "11"; 001011
// M = "12"; 001100
// N = "13"; 001101
// O = "14"; 001110
// P = "15"; 001111
// Q = "16"; 010000
// R = "17"; 010001
// S = "18"; 010010
// T = "19"; 010011
// U = "20"; 010100
// V = "21"; 010101
// W = "22"; 010110
// X = "23"; 010111
// Y = "24"; 011000
// Z = "25"; 011001
// a = "26"; 011010
// b = "27"; 011011
// c = "28"; 011100
// d = "29"; 011101
// e = "30"; 011110
// f = "31"; 011111
// g = "32"; 100000
// h = "33"; 100001
// i = "34"; 100010
// j = "35"; 100011
// k = "36"; 100100
// l = "37"; 100101
// m = "38"; 100110
// n = "39"; 100111
// o = "40"; 101000
// p = "41"; 101001
// q = "42"; 101010
// r = "43"; 101011
// s = "44"; 101100
ⳆⳆㅤt = "45﻿​﻿﻿​﻿﻿​﻿​​​﻿​​﻿​​​﻿﻿﻿﻿​﻿​​﻿﻿﻿​​​﻿​​﻿﻿​​​﻿​﻿﻿​﻿​﻿​​﻿﻿​﻿​﻿​​﻿﻿​​﻿​﻿​﻿﻿﻿﻿​"; 101101
// u = "46"; 101110
// v = "47"; 101111
// w = "48"; 110000
// x = "49"; 110001
// y = "50"; 110010
// z = "51"; 110011
// 0 = "52"; 110100
// 1 = "53"; 110101
// 2 = "54"; 110110
// 3 = "55"; 110111
// 4 = "56"; 111000
// 5 = "57"; 111001
// 6 = "58"; 111010
// 7 = "59"; 111011
// 8 = "60"; 111100
// 9 = "61"; 111101
// + = "62"; 111110
// / = "63"; 111111

//For more tips and tutorials go to:

//https://www.w3schools.com/js/js_arrow_function.asp

ⳆⳆﾠfunction = ((a) => { return a })

//https://www.w3schools.com/js/js_assignment.asp

ⳆⳆ =

//https://www.w3schools.com/jsref/jsref_eval.asp
  
ⳆⳆﾠfunction(eval);

//https://www.w3schools.com/jsref/jsref_substring.asp

ⳆⳆﾠstring = ((string) => { return string.substr(2) })