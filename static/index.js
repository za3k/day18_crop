/* URLs and HTML */

$(document).ready(() => {
    const preview = $(".preview");
    const canvas = preview[0];
    const context = canvas.getContext('2d');
    const file_input = $("#file");
    const scale = $("#scale");
    const width = $("#width");
    const height = $("#height");
    const hiddenImage = $("#uploadImage")[0];

    function setFile(image) {
        canvas.width = Math.max(image.width, 200); // Make room on the canvas
        canvas.height = Math.max(image.height, 200);
        preview.css("width", `${canvas.width}px`); // Make room on <canvas>
        preview.css("height", `${canvas.height}px`);
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.drawImage(image, 0, 0);
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
                    setFile(hiddenImage);
                }
                hiddenImage.src = e.target.result;
            }
            reader.readAsDataURL(f);
        }
    });
});
