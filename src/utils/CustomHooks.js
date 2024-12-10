"use es6";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useLocation } from "react-router-dom";

const getWindowDimensions = () => {
  const { innerWidth: width, innerHeight: height } = window;
  return {
    width,
    height,
  };
};

const useWindowDimensions = () => {
  const [windowDimensions, setWindowDimensions] = useState(
    getWindowDimensions()
  );

  useEffect(() => {
    function handleResize() {
      setWindowDimensions(getWindowDimensions());
    }

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return windowDimensions;
};

const safeDocument = typeof document !== "undefined" ? document : {};

const useScrollBlock = () => {
  const scrollBlocked = useRef();
  const html = safeDocument.documentElement;
  const { body } = safeDocument;

  const blockScroll = () => {
    if (!body || !body.style || scrollBlocked.current) return;

    const scrollBarWidth = window.innerWidth - html.clientWidth;
    const bodyPaddingRight =
      parseInt(
        window.getComputedStyle(body).getPropertyValue("padding-right")
      ) || 0;

    /**
     * 1. Fixes a bug in iOS and desktop Safari whereby setting
     *    `overflow: hidden` on the html/body does not prevent scrolling.
     * 2. Fixes a bug in desktop Safari where `overflowY` does not prevent
     *    scroll if an `overflow-x` style is also applied to the body.
     */
    html.style.position = "relative"; /* [1] */
    html.style.overflow = "hidden"; /* [2] */
    body.style.position = "relative"; /* [1] */
    body.style.overflow = "hidden"; /* [2] */
    body.style.paddingRight = `${bodyPaddingRight + scrollBarWidth}px`;

    scrollBlocked.current = true;
  };

  const allowScroll = () => {
    if (!body || !body.style || !scrollBlocked.current) return;

    html.style.position = "";
    html.style.overflow = "";
    body.style.position = "";
    body.style.overflow = "";
    body.style.paddingRight = "";

    scrollBlocked.current = false;
  };

  return [blockScroll, allowScroll];
};

const usePathname = () => {
  const location = useLocation();
  return location.pathname;
};

const useLongPress = ({
  onClick = () => {},
  onLongPress = () => {},
  ms = 300,
} = {}) => {
  const timerRef = useRef(false);
  const eventRef = useRef({});

  const callback = useCallback(() => {
    onLongPress(eventRef.current);
    eventRef.current = {};
    timerRef.current = false;
  }, [onLongPress]);

  const start = useCallback(
    (ev) => {
      ev.persist();
      eventRef.current = ev;
      timerRef.current = setTimeout(callback, ms);
    },
    [callback, ms]
  );

  const stop = useCallback(
    (ev) => {
      ev.persist();
      eventRef.current = ev;
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        onClick(eventRef.current);
        timerRef.current = false;
        eventRef.current = {};
      }
    },
    [onClick]
  );

  return useMemo(
    () => ({
      onMouseDown: start,
      onMouseUp: stop,
      onMouseLeave: stop,
      onTouchStart: start,
      onTouchEnd: stop,
    }),
    [start, stop]
  );
};

const useComponentVisible = (initialIsVisible) => {
  const [isComponentVisible, setIsComponentVisible] =
    useState(initialIsVisible);
  const ref = useRef(null);

  const handleClickOutside = (event) => {
    if (ref.current && !ref.current.contains(event.target)) {
      setIsComponentVisible(false);
    }
  };

  useEffect(() => {
    document.addEventListener("click", handleClickOutside, true);
    return () => {
      document.removeEventListener("click", handleClickOutside, true);
    };
  }, []);

  return { ref, isComponentVisible, setIsComponentVisible };
};

export {
  useWindowDimensions,
  useScrollBlock,
  usePathname,
  useLongPress,
  useComponentVisible,
};
