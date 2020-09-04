const video_tag = document.querySelector("video");
const video_source_tag = document.querySelector("#video-source")
const help_tag = document.querySelector("#help-text")

let done_resizing_timeout = null
let webcam_original_size = {
    width: null,
    height: null,
}

navigator.mediaDevices.enumerateDevices().then(devices => {
    for (const device of devices) {
        if (device.kind !== "videoinput") {
            continue
        }

        let option_tag = document.createElement("option")
        option_tag.textContent = device.label
        option_tag.setAttribute('value', device.deviceId)
        video_source_tag.appendChild(option_tag)
    }
})

video_source_tag.addEventListener("change", e => {
    help_tag.remove()

    const device_id = video_source_tag.value

    navigator.mediaDevices.getUserMedia({
        video: {
            deviceId: { exact: device_id },
            width: 1280,
            height: 720,
        }
    }).then(stream => {
        const stream_settings = stream.getVideoTracks()[0].getSettings()

        webcam_original_size.width = stream_settings.width
        webcam_original_size.height = stream_settings.height

        const new_window_width = Math.min(window.innerWidth, stream_settings.width)
        const ratio_height = stream_settings.height / stream_settings.width
        const new_window_height = Math.min(window.innerHeight, new_window_width * ratio_height)

        window.resizeTo(new_window_width, new_window_height)

        video_tag.srcObject = stream
    })
})

window.addEventListener("resize", e => {
    if (webcam_original_size.width === null) {
        return
    }

    clearTimeout(done_resizing_timeout)

    done_resizing_timeout = setTimeout(() => {

        const original_ratio = webcam_original_size.width / webcam_original_size.height
        const current_ratio = window.innerWidth / window.innerHeight

        // full width, empty height space
        if (original_ratio > current_ratio) {
            const ratio_height = webcam_original_size.height / webcam_original_size.width
            const new_window_height = Math.ceil(window.innerWidth * ratio_height)
            window.resizeTo(window.innerWidth, new_window_height)

        // full height, empty width space
        } else {
            const ratio_width = webcam_original_size.width / webcam_original_size.height
            const new_window_width = Math.ceil(window.innerHeight * ratio_width)
            window.resizeTo(new_window_width, window.innerHeight)
        }
    }, 250)
})

window.addEventListener("keydown", e => {
    if (e.key == "f") {
        video_tag.classList.toggle("flip")
    }
})