import gsap from 'gsap'

export const beforeEnter = (el) => {
    if (el.classList[0] === 'map-canvas' || el.classList[0]=== 'weather_block') {
      el.style.transform = 'translateY(60px)';
    }
    el.style.opacity = 0;
  };
  
export const enter = (el,done) => {
    let duration = 1;
    let y_Location = 0;
    let opacity = 1;
    let keyIndex = el.dataset.index ? el.dataset.index : 1

    if (el.classList[0] === 'map-canvas') {
        duration = 1.5;
    }

    gsap.to(el, {
        duration: duration,
        y: y_Location,
        opacity: opacity,
        onComplete:done,
        delay: keyIndex* 0.2
    });
};

