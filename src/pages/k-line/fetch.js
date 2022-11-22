import axios from 'axios';

const instance = axios.create({
  baseURL: 'https://api.binance.com/',
  timeout: 1000,
});

export function getKLineData(params = {
  symbol: 'BTCUSDT',
  interval: '1d',
}) {
  return instance.get('/api/v3/klines', {
    params: {
      limit: 1000,
      ...params,
    },
  }).then(res => {
    return res.data.map(item => {
      const [time, open, high, low, close, value, endTime] = item;
      return { time: time / 1000, open, high, low, close, value, endTime: endTime / 1000 };
    })
  });
}

export async function getSymbols() {
  const cacheResult = localStorage.getItem('symbols_cache');
  if (cacheResult) {
    return JSON.parse(cacheResult);
  }
  return instance.get('/api/v3/exchangeInfo').then(res => {
    const result = Array.from(new Set(res.data.symbols.map(item => item.symbol))).map(item => ({
      label: item,
      value: item,
    }));
    localStorage.setItem('symbols_cache', JSON.stringify(result));
    return result;
  });
}