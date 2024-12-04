// 使用 base62 字符集 (0-9, A-Z, a-z)
const base62Chars =
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

// Base62 编码函数
function base62Encode(bigIntNum) {
  let encoded = "";
  while (bigIntNum > 0) {
    encoded = base62Chars[bigIntNum % 62n] + encoded; // 确保使用 BigInt 进行操作
    bigIntNum = bigIntNum / 62n; // BigInt 的除法
  }
  return encoded;
}

// Base62 解码函数
function base62Decode(base62Str) {
  let decoded = 0n; // 使用 BigInt 处理较大数字
  for (let i = 0; i < base62Str.length; i++) {
    decoded = decoded * 62n + BigInt(base62Chars.indexOf(base62Str[i]));
  }
  return decoded;
}

// 将字符串转换为 Base62 的函数
export function stringToBase62(str) {
  const bytes = new TextEncoder().encode(str); // 将字符串转成字节数组
  let num = BigInt(
    "0x" + [...bytes].map((b) => b.toString(16).padStart(2, "0")).join("")
  ); // 转成十六进制
  return base62Encode(num); // 使用 Base62 编码
}

// 将 Base62 转回原始字符串
export function base62ToString(base62Str) {
  const num = base62Decode(base62Str); // 解码为 BigInt
  const hex = num.toString(16); // 转为十六进制字符串
  const bytes = new Uint8Array(
    hex.match(/.{1,2}/g).map((byte) => parseInt(byte, 16))
  ); // 转为字节数组
  return new TextDecoder().decode(bytes); // 解码为原始字符串
}

// // 测试字符串
// const originalStr = '5-8785af4c-c35f-427d-8eb7-51ce85556dc5';
// const base62Str = stringToBase62(originalStr); // 将字符串转换为 Base62

// console.log('Base62 编码后的字符串: ', base62Str);

// // 解码回原始字符串
// const decodedStr = base62ToString(base62Str);
// console.log('解码后的原字符串: ', decodedStr);
