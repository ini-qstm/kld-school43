var width = 1200; //ширина картинки
if (width > document.documentElement.clientWidth){
    width = document.documentElement.clientWidth;
}
document.documentElement.style.setProperty('--img-width', width + "px"); //ставим ширину картинки

let slider = document.getElementById("sliderBody"),
    sliderList = document.getElementById("sliderContainer"),
    sliderTrack = document.getElementById("slider"),
    slides = document.getElementsByClassName("slider__img-container");
    sliderTrack.style.width = slides.length * width + "px";
    prev = document.getElementById("leftBtn"),
    next = document.getElementById("rightBtn");
var slideWidth = slides[0].offsetWidth,
    slideIndex = 0;
let prevSlideIndex = 0,
    useBtns = true,
    posInit = 0,
    posX1 = 0,
    posX2 = 0,
    posY1 = 0,
    posY2 = 0,
    posFinal = 0,
    isSwipe = false,
    isScroll = false,
    allowSwipe = true,
    transition = true,
    nextTrf = 0,
    prevTrf = 0,
    lastTrf = --slides.length * slideWidth,
    swipeRatio = 0.17, //множитель, отвечающий за то, насколько далеко нужно провести пальцем или курсором вбок, чтобы перелестнуть 
    posThreshold = slides[0].offsetWidth * swipeRatio,
    trfRegExp = /([-0-9.]+(?=px))/,
    dontTouch = false, //не изменять slideIndex
    
    getEvent = function() {
        return (event.type.search('touch') !== -1) ? event.touches[0] : event;
    },
    //fast: cubic-bezier(0,0,.19,.95)
    //standart: cubic-bezier(.38,.09,.58,1.02)
    slide = function() { //надо будет сделать расчет таймингов на основе того, как пользователь делает свайп
        // if (transition) {
        //     if ((IsPC || MaybePC) || useBtns){ //|| window.focus()
        //         sliderTrack.style.transition = "transform 0.45s cubic-bezier(.35,.01,.58,1.03)";
        //         //cubic-bezier(.06,.11,.49,.95) cubic-bezier(.31,.1,.49,.95)
        //     }
        //     else{
        //         sliderTrack.style.transition = "transform 0.5s cubic-bezier(0,0,.19,.95)";
        //     }
        //     // sliderTrack.style.transition = 'transform .65s cubic-bezier(0,0,.19,.95)';
        // }
        sliderTrack.style.transform = `translate3d(-${slideIndex * slideWidth}px, 0px, 0px)`;

        // setValues();

        // prev.classList.toggle('disabled', slideIndex === 0);
        // next.classList.toggle('disabled', slideIndex === --slides.length);
    },
    swipeStart = function() {
        let evt = getEvent();
        if (allowSwipe) {

            transition = true;

            nextTrf = (slideIndex + 1) * -slideWidth;
            prevTrf = (slideIndex - 1) * -slideWidth;

            posInit = posX1 = evt.clientX;
            posY1 = evt.clientY;

            sliderTrack.style.transition = '';

            document.addEventListener('touchmove', swipeAction);
            document.addEventListener('mousemove', swipeAction);
            document.addEventListener('touchend', swipeEnd);
            document.addEventListener('mouseup', swipeEnd);

            sliderList.classList.remove('grab');
            sliderList.classList.add('grabbing');
        }
    },
    swipeAction = function() {
        // getSlideIndexToGlobal();
        let evt = getEvent(),
            style = sliderTrack.style.transform,
            transform = +style.match(trfRegExp)[0];

            posX2 = posX1 - evt.clientX;
            posX1 = evt.clientX;

            posY2 = posY1 - evt.clientY;
            posY1 = evt.clientY;

        // определение действия свайп или скролл
        if (!isSwipe && !isScroll) {
            let posY = Math.abs(posY2);
            if (posY > 7 || posX2 === 0) {
                isScroll = true;
                allowSwipe = false;
            } else if (posY < 7) {
                isSwipe = true;
            }
        }

        if (isSwipe) {
            // запрет ухода влево на первом слайде
            if (slideIndex === 0) {
                if (posInit < posX1) {
                    slideIndex = slides.length - 1;
                    setTransform(transform, slideIndex * width);
                    dontTouch = true; //чтобы не как не изменялась slideIndex
                    return;
                }
                allowSwipe = true;
            }

            // запрет ухода вправо на последнем слайде
            if (slideIndex === --slides.length) {
                if (posInit > posX1) {
                    slideIndex = 0;
                    setTransform(transform, -width);
                    dontTouch = true; //чтобы не как не изменялась slideIndex
                    return;
                }
               allowSwipe = true;
            }

            //запрет протаскивания дальше одного слайда
            if (posInit > posX1 && transform < nextTrf || posInit < posX1 && transform > prevTrf) {
                reachEdge();
                return;
            }
            // двигаем слайд
            sliderTrack.style.transform = `translate3d(${transform - posX2}px, 0px, 0px)`;
        }

    },
    swipeEnd = function() {
        posFinal = posInit - posX1;

        isScroll = false;
        isSwipe = false;
        useBtns = false;

        document.removeEventListener('touchmove', swipeAction);
        document.removeEventListener('mousemove', swipeAction);
        document.removeEventListener('touchend', swipeEnd);
        document.removeEventListener('mouseup', swipeEnd);

        sliderList.classList.add('grab');
        sliderList.classList.remove('grabbing');

        if (allowSwipe) {
            if (Math.abs(posFinal) > posThreshold && !dontTouch) {
                prevSlideIndex = slideIndex;
                if (posInit < posX1) {
                    slideIndex--;
                } else if (posInit > posX1) {
                    slideIndex++;
                }
            }
            dontTouch=false;

            if (posInit !== posX1) {
                allowSwipe = false;
                slide();
            } else {
                allowSwipe = true;
            }

        } else {
            allowSwipe = true;
        }
        // getSlideIndexToGlobal();
        // if (slides.length > 5){ //если слайдов больше 5, то выключаем слайды, которые не видны пользователю
        //     offInvisibleScreens()
        // }

    },
    setTransform = function(transform, comapreTransform) {
        if (transform >= comapreTransform) {
            if (transform > comapreTransform) {
                sliderTrack.style.transform = `translate3d(${comapreTransform}px, 0px, 0px)`;
            }
        }
        allowSwipe = false;
    },
    reachEdge = function() {
        transition = false;
        swipeEnd();
        allowSwipe = true;
    };

// function getSlideIndexToGlobal(){
//     const infoBlock = document.createElement("span");
//     if (document.getElementById("getInfoFromScripts").childElementCount == 0){
//         document.getElementById("getInfoFromScripts").appendChild(infoBlock).textContent = slideIndex;
//     }
//     else{
//         document.getElementById("getInfoFromScripts").children[0].textContent = slideIndex;
//     }
// }
sliderTrack.style.transform = 'translate3d(0px, 0px, 0px)';
sliderList.classList.add('grab');

sliderTrack.addEventListener('transitionend', () => allowSwipe = true);
slider.addEventListener('touchstart', swipeStart);
slider.addEventListener('mousedown', swipeStart);

prev.addEventListener("click", () => {
    if(slideIndex != 0){
        slideIndex--; 
    }
    else{
        slideIndex = slides.length - 1;
    }
    useBtns = true;
    slide()
});
next.addEventListener("click", () => {
    if (slideIndex < slides.length - 1){
        slideIndex++;
    }
    else{
        slideIndex = 0;
    }
    useBtns = true;
    slide()
});

document.addEventListener("keydown", function(event){ //управление клавиатурой
    useBtns = true;
    if (event.key == "ArrowLeft"){
        if (slideIndex != 0){
            slideIndex--;
        }
        else{
            slideIndex = slides.length - 1;
        }
        slide();
    }
    if (event.key == "ArrowRight"){
        if (slideIndex < slides.length - 1){
            slideIndex++;
        }
        else{
            slideIndex = 0;
        }
        slide();
    }
    // if (event.key == "Escape" || event.key == "Backspace"){
        
    // }
});