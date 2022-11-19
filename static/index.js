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
        function moveAt(clientX, clientY) {
            const requestedLeft = clientX - container[0].getBoundingClientRect().left - shiftX
            const requestedTop = clientY - container[0].getBoundingClientRect().top - shiftY;
            const limitRight = container.width() - thing.width();
            const limitBottom = container.height() - thing.height();
            const left = Math.min(Math.max(0, requestedLeft), limitRight);
            const top = Math.min(Math.max(0, requestedTop), limitBottom);
            thing.css("left", `${left}px`);
            thing.css("top", `${top}px`);
            onChange();
        }
        moveAt(ev.clientX, ev.clientY);

        function onMouseMove(ev) {
            moveAt(ev.clientX, ev.clientY); // may not be all browsers
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
    const save = $("a.save");
    const highlight = $(".highlight");
    const width_input = $("#width");
    const height_input = $("#height");
    const filename_input = $("#filename");
    const onlyIf = $(".editing-only");
    const hiddenImage = new Image();
    let filename;
    let scale = 1.0;

    function setFile(image, scale) {
        const canvas = display[0];
        const context = window.context = canvas.getContext('2d');
        save.off("click", saveImage);
        if (image) {
            canvas.width = image.width*scale; // Make room on the canvas
            canvas.height = image.height*scale;
            display.width(canvas.width); // Make room on <canvas>
            display.height(canvas.height);
            context.drawImage(image, 0, 0, image.width, image.height, 0, 0, canvas.width, canvas.height);
            save.on("click", saveImage);
            onlyIf.show();
        } else {
            context.clearRect(0, 0, canvas.width, canvas.height);
            onlyIf.hide();
        }
        updatePreview();
    }
    function updatePreview() {
        const previewCanvas = preview[0]
        const context = previewCanvas.getContext('2d');
        const left = highlight.css("left").slice(0,-2);
        const top = highlight.css("top").slice(0,-2);
        const width = highlight.width();
        const height = highlight.height();
        context.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
        if (display[0].width != 0) context.drawImage(display[0], left, top, width, height, 0, 0, width, height);
    }
    function saveImage(ev) {
        var link = ev.currentTarget;
        $(link).prop("href", preview[0].toDataURL("image/png"))
               .prop("download", filename + ".png");
    }

    filename_input.on("change", (ev) => {
        filename = ev.currentTarget.value;
    });
    $("#file").change((ev) => {
        const f = ev.target.files[0];
        if (!f) setFile();
        else if (!f.type.startsWith("image/")) setFile();
        else {
            filename_input[0].value = filename = f.name.split(/(\\|\/)/g).pop().split(".")[0];
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
    setFile();

    $("#scale").on("input", (ev) => {
        scale = ev.currentTarget.trueValue;
        setFile(hiddenImage, scale);
        updatePreview();
    });

    function updateCropSize() {
        const width = width_input[0].value;
        const height = height_input[0].value;

        highlight.width(width);
        preview.width(width);
        preview[0].width = width;

        highlight.height(height);
        preview.height(height);
        preview[0].height = height;

        updatePreview();
    }
    width_input.on("change", updateCropSize);
    height_input.on("change", updateCropSize);
    updateCropSize();


    makeDraggable(highlight, display, updatePreview);
});
