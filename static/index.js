/* URLs and HTML */

/* UI magic */
function makeScaled(slider, f, finv) {
    const origMin = slider.min;
    const origMax = slider.max;
    const origValue = slider.value;
    const newMin = finv(slider.min);
    const newMax = finv(slider.max);
    const newValue = finv(slider.value);
    slider.min = newMin;
    slider.max = newMax;
    slider.value = newValue;
    slider.trueValue = origValue;
    slider.addEventListener('input', function(ev) {
        slider.trueValue = f(slider.value);
    });
    return slider;
}
displaySlider = function(slider, display) {
    slider.addEventListener('input', function(ev) {
        display.innerHTML = (slider.trueValue || slider.value).toPrecision(2);
    });
    return slider;
}
makeLogarithmic = (slider) => { return makeScaled(slider, Math.exp, Math.log); };
$(document).ready(() => {
    // Note, doesn't detect adding after page load, no good for volume bars
    $(".scale-logarithmic").each(function() { // => binds this
        makeLogarithmic(this);
    });
    $(".display-range").each(function() { // => binds this
        const slider = this;
        const display = document.getElementById(slider.getAttribute("display"));
        displaySlider(slider, display);
    });
})

function makeDraggable(thing, container, onChange) { // Takes two jquery objects
    thing.on("mousedown", (ev) => {
        let shiftX = ev.clientX - thing[0].getBoundingClientRect().left;
        let shiftY = ev.clientY - thing[0].getBoundingClientRect().top;
        function moveAt(pageX, pageY) {
            const requestedLeft = pageX - container[0].getBoundingClientRect().left - shiftX
            const requestedTop = pageY - container[0].getBoundingClientRect().top - shiftY;
            const limitRight = container.width() - thing.width();
            const limitBottom = container.height() - thing.height();
            const left = Math.min(Math.max(0, requestedLeft), limitRight);
            const top = Math.min(Math.max(0, requestedTop), limitBottom);
            thing.css("left", `${left}px`);
            thing.css("top", `${top}px`);
            onChange();
        }
        moveAt(ev.pageX, ev.pageY);

        function onMouseMove(ev) {
            moveAt(ev.pageX, ev.pageY);
        }
        function onMouseUp(ev) {
            $(document).off("mousemove", onMouseMove);
            thing.off("mouseup", onMouseUp);
            thing.toggleClass("dragged", false);
        }
        thing.toggleClass("dragged", true);
        $(document).on("mousemove", onMouseMove);
        thing.on("mouseup", onMouseUp);
    });

}

$(document).ready(() => {
    const display = $(".display");
    const preview = $(".preview");
    const file_input = $("#file");
    const scale_input = window.scale = $("#scale");
    const width = $("#width");
    const height = $("#height");
    const highlight = $(".highlight");
    const hiddenImage = window.hiddenImage = $("#uploadImage")[0];

    let scale = 1.0;

    function setFile(image, scale) {
        const canvas = display[0];
        canvas.width = image.width*scale; // Make room on the canvas
        canvas.height = image.height*scale;
        display.width(canvas.width); // Make room on <canvas>
        display.height(canvas.height);
        const context = window.context = canvas.getContext('2d');
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.drawImage(image, 0, 0, image.width, image.height, 0, 0, canvas.width, canvas.height);
        updatePreview();
    }
    function updatePreview() {
        const previewCanvas = preview[0]
        const context = previewCanvas.getContext('2d');
        const left = highlight.css("left").slice(0,-2);
        const top = highlight.css("top").slice(0,-2);
        const width = highlight.width();
        const height = highlight.height();
        if (display[0].width == 0) context.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
        else context.drawImage(display[0], left, top, width, height, 0, 0, width, height);
    }

    file_input.change((ev) => {
        const f = ev.target.files[0];
        if (!f) setFile();
        else if (!f.type.startsWith("image/")) setFile();
        else {
            const reader = new FileReader();
            //URL.createObjectURL instead of FileReader?
            reader.onload = (e) => {
                hiddenImage.onload = () => {
                    setFile(hiddenImage, scale);
                }
                hiddenImage.src = e.target.result;
            }
            reader.readAsDataURL(f);
        }
    });

    scale_input.on("input", (ev) => {
        scale = scale_input[0].trueValue;
        setFile(hiddenImage, scale);
        updatePreview();
    });
    width.on("change", (ev) => {
        highlight.width(width[0].value);
        preview.width(width[0].value);
        preview[0].width = width[0].value;
        updatePreview();
    });
    height.on("change", (ev) => {
        highlight.height(height[0].value);
        preview.height(height[0].value);
        preview[0].height = height[0].value;
        updatePreview();
    });
    highlight.width(width[0].value);
    highlight.height(height[0].value);
    preview.width(width[0].value);
    preview.height(height[0].value);
    preview[0].width = width[0].value;
    preview[0].height = height[0].value;

    makeDraggable(highlight, display, updatePreview);
});
