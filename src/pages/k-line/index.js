import React, { useRef, useState, useEffect, useCallback } from 'react';

import { Select, Switch, DatePicker, ConfigProvider, Button } from 'antd';
import { createChart } from 'lightweight-charts';
import locale from 'antd/locale/zh_CN';
import 'dayjs/locale/zh-cn';
import dayjs from 'dayjs';

import { getKLineData, getSymbols } from './fetch';

import fixed2Dot from '../../utils/fixed2dot';
import getLineColor from '../../utils/get-line-color';

import { SETTING_WIDTH } from '../../constants/ui';
import intervals from '../../constants/interval';
import limits from '../../constants/limit';

import './index.css';

export default function KLine() {
  const wrapperRef = useRef();
  const kLineCanvasRef = useRef();
  const chartRef = useRef();
  const histogramSeriesRef = useRef();
  const candlestickSeriesRef = useRef();
  const datafeeds = useRef([]);
  const [limit, setLimit] = useState(1000);
  const [beforeTime, setBeforeTime] = useState({ time: 0, loading: true });
  const [afterTime, setAfterTime] = useState({ time: 0, loading: true });

  const [startTime, setStartTime] = useState();
  const [endTime, setEndTime] = useState();
  const [volumeVisible, setVolumeVisible] = useState(true);
  const [interval, setInterval] = useState('4h');
  const [symbol, setSymbol] = useState('BTCUSDT');
  const [symbols, setSymbols] = useState([]);
  const [crosshairMoveData, setCrosshairMoveData] = useState();

  useEffect(() => {
    getSymbols().then(setSymbols);
  }, []);

  useEffect(() => {
    const onResize = () => {
      if (chartRef.current && wrapperRef.current) {
        chartRef.current.resize(wrapperRef.current.clientWidth - SETTING_WIDTH, wrapperRef.current.clientHeight)
      }
    }
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
    }
  }, []);

  useEffect(() => {
    if (kLineCanvasRef.current) {
      chartRef.current = createChart(kLineCanvasRef.current, {
        layout: {
          textColor: '#d1d4dc',
          backgroundColor: '#131722',
        },
        rightPriceScale: {
          scaleMargins: {
            top: 0.25,
            bottom: 0.25,
          },
        },
        timeScale: {
          visible: true,
          rightOffset: 6,
          timeVisible: true,
          tickMarkFormatter(n) {
            return new Date(n * 1000).toLocaleDateString()
          }
        },
        crosshair: {
          mode: 0,
          vertLine: {
            width: 1,
            color: 'rgba(224, 227, 235, 0.1)',
            style: 0,
          },
          horzLine: {
            visible: true,
            labelVisible: true,
          },
        },
        localization: {
          locale: 'zh-Hans-CN',
          timeFormatter(e) {
            return dayjs(e * 1000).format('YYYY/MM/DD HH:mm');
          }
        },
        grid: {
          vertLines: {
            visible: false,
          },
          horzLines: {
            visible: false,
          },
        },
      });

      candlestickSeriesRef.current = chartRef.current.addCandlestickSeries({
        priceLineVisible: false,
      });

      chartRef.current.subscribeCrosshairMove(item => {
        setCrosshairMoveData(item.time ? {
          time: item.time,
          ...item.seriesPrices.get(candlestickSeriesRef.current),
          value: item.seriesPrices.get(histogramSeriesRef.current)
        } : undefined);
      });
    }
    return () => {
      chartRef.current?.remove();
    }
  }, []);

  useEffect(() => {
    if (volumeVisible) {
      histogramSeriesRef.current = chartRef.current.addHistogramSeries({
        priceLineVisible: false,
        lastValueVisible: false,
        priceFormat: {
          type: 'volume',
        },
        overlay: true,
        scaleMargins: {
          top: 0.9,
          bottom: 0,
        },
      });
      histogramSeriesRef.current.setData(datafeeds.current.map(item => {
        return { ...item, color: getLineColor(item) };
      }));
    } else {
      histogramSeriesRef.current && chartRef.current.removeSeries(histogramSeriesRef.current);
    }
  }, [volumeVisible]);

  const loadKLine = useCallback((params) => {
    setBeforeTime(res => ({
      ...res,
      loading: true,
    }));
    setAfterTime(res => ({
      ...res,
      loading: true,
    }));
    getKLineData({
      symbol,
      interval,
      ...({
        startTime: params ? params.startTime : startTime,
        endTime: params ? params.endTime : endTime,
        limit: params ? params.limit : 1000,
      }),
    }).then(res => {
      setBeforeTime({
        time: res[0].time,
        loading: false,
      });
      setAfterTime({
        time: res[res.length - 1].endTime,
        loading: false,
      });
      datafeeds.current = params ? [
        ...(params.pos === 'before' ? res : []),
        ...datafeeds.current,
        ...(params.pos === 'after' ? res : []),
      ] : res;
      candlestickSeriesRef.current.setData(datafeeds.current);
      histogramSeriesRef.current.setData(datafeeds.current.map(item => {
        return { ...item, color: getLineColor(item) };
      }));
    });
  }, [symbol, interval, startTime, endTime]);

  useEffect(() => {
    loadKLine();
  }, [symbol, interval, startTime, endTime]);

  function loadMoreKLine(key) {
    switch (key) {
      case 'before':
        loadKLine({
          endTime: beforeTime.time * 1000 - 1,
          limit,
          pos: key,
        });
        break;
      case 'after':
        loadKLine({
          startTime: afterTime.time * 1000 + 1,
          limit,
          pos: key,
        });
        break;
      default:
        break;
    }
  }

  return <div className="k-line-wrapper" ref={wrapperRef}>
    <div className="k-line-canvas" ref={kLineCanvasRef}>
      {crosshairMoveData && <div className="price-wrapper" style={{ color: getLineColor(crosshairMoveData) }}>
        <div className="price-item">开盘价：{fixed2Dot(crosshairMoveData.open)}</div>
        <div className="price-item">收盘价：{fixed2Dot(crosshairMoveData.close)}</div>
        <div className="price-item">最高价：{fixed2Dot(crosshairMoveData.high)}</div>
        <div className="price-item">最低价：{fixed2Dot(crosshairMoveData.low)}</div>
      </div>}
    </div>
    <div className="settings-wrapper" style={{ width: SETTING_WIDTH }}>
      <div className="settings-wrapper-top">
        <div className="settings-form-row">
          <div className="settings-form-row-label">交易对：</div>
          <Select className="settings-form-row-content" showSearch defaultValue={symbol} options={symbols} onChange={setSymbol} />
        </div>
        <div className="settings-form-row">
          <div className="settings-form-row-label">时间周期：</div>
          <Select className="settings-form-row-content" defaultValue={interval} options={intervals} onChange={setInterval} />
        </div>
        <div className="settings-form-row">
          <div className="settings-form-row-label">交易量：</div>
          <Switch className="settings-form-row-content settings-form-row-content-switch" defaultChecked={volumeVisible} onChange={setVolumeVisible} />
        </div>
        <div className="settings-form-row">
          <div className="settings-form-row-label">开始时间：</div>
          <ConfigProvider locale={locale}>
            <DatePicker showTime className="settings-form-row-content" onChange={e => setStartTime(e.valueOf())} />
          </ConfigProvider>
        </div>
        <div className="settings-form-row">
          <div className="settings-form-row-label">结束时间：</div>
          <ConfigProvider locale={locale}>
            <DatePicker showTime className="settings-form-row-content" onChange={e => setEndTime(e.valueOf())} />
          </ConfigProvider>
        </div>
      </div>
      <div className="settings-wrapper-bottom">
        {interval !== '1M' && <div className="settings-form-row">
          <div className="settings-form-row-label">加载K数：</div>
          <Select className="settings-form-row-content" defaultValue={limit} options={limits} onChange={setLimit} />
        </div>}
        <div className="settings-form-row">
          <Button type="primary" loading={beforeTime.loading} onClick={() => loadMoreKLine('before')}>往前加载</Button>
        </div>
        <div className="settings-form-row">
          <Button type="primary" loading={afterTime.loading} onClick={() => loadMoreKLine('after')}>往后加载</Button>
        </div>
        <div className="settings-form-row">
          <Button type="primary" onClick={() => chartRef.current?.timeScale().fitContent()}>重置坐标</Button>
        </div>
      </div>
    </div>
  </div>
}