initDraw(document.getElementById('canvas'));

const form = document.forms.rclass;
const radios = form.elements.class;

function initDraw(canvas) {
    function setMousePosition(e) {
        var ev = e || window.event; //Moz || IE
        if (ev.pageX) { //Moz
            mouse.x = ev.pageX + window.pageXOffset;
            mouse.y = ev.pageY + window.pageYOffset;
        } else if (ev.clientX) { //IE
            mouse.x = ev.clientX + document.body.scrollLeft;
            mouse.y = ev.clientY + document.body.scrollTop;
        }
    };

    var mouse = {
        x: 0,
        y: 0,
        startX: 0,
        startY: 0
    };
    var element = null;

    // var roi = {};
    var id = 1;
    canvas.onmousemove = function (e) {
        setMousePosition(e);
        if (element !== null) {
            element.style.width = Math.abs(mouse.x - mouse.startX) + 'px';
            element.style.height = Math.abs(mouse.y - mouse.startY) + 'px';
            element.style.left = (mouse.x - mouse.startX < 0) ? mouse.x + 'px' : mouse.startX + 'px';
            element.style.top = (mouse.y - mouse.startY < 0) ? mouse.y + 'px' : mouse.startY + 'px';
        }
    }

    canvas.onclick = function (e) {

        if (element !== null) {
            var sub_roi = {
                id: id,
                type: radios.value,
                left: element.style.left,
                width: element.style.width,
                top: element.style.top,
                height: element.style.height
            };
            // roi[id] = sub_roi;
            insertDiv(sub_roi, id)
            id +=1;
            element = null;
            canvas.style.cursor = "default";
            console.log("finsihed.");

            $.ajax({
                type: "POST",
                url: "/postmethod",
                contentType: "application/json",
                data: JSON.stringify({sub_roi}),
                dataType: "json",
                success: function(response) {
                    console.log('HERE');
                    console.log(response);
                },
                error: function(err) {
                    console.log('NOW');
                    console.log(err);
                }
            });

        } else {
            console.log("begun.");
            mouse.startX = mouse.x;
            mouse.startY = mouse.y;
            element = document.createElement('div');
            element.className = 'rectangle';
            element.setAttribute("id", "rectangle"+id);
            element.style.left = mouse.x + 'px';
            element.style.top = mouse.y + 'px';
            element.style.borderColor = getColor(radios.value);
            canvas.appendChild(element)
            canvas.style.cursor = "crosshair";
        }
    }
}

function insertDiv(e, id) {
    var parent = document.getElementsByClassName("list-group")[0];
    var sp = document.createElement('span');
    var span_text = document.createTextNode(`${id}: ${e.type}`);
    sp.appendChild(span_text);
    var installment = document.createElement('div');
    installment.classList.add("installment");    
    installment.setAttribute("id", "installment"+id);
    installment.appendChild(sp);
    installment.setAttribute('style', 'color:'+getColor(e.type));
    parent.appendChild(installment);
    document.getElementById("installment"+id).onclick = function removeRect() {
        var elem = document.getElementById("rectangle"+id);
        elem.parentNode.removeChild(elem);
        this.remove();
        $.ajax({
            type: "POST",
            url: "/delmethod",
            contentType: "application/json",
            data: JSON.stringify({id}),
            dataType: "json",
            success: function(response) {
                console.log('HERE*');
                console.log(response);
            },
            error: function(err) {
                console.log('NOW*');
                console.log(err);
            }
        });
    }
    document.getElementById("installment"+id).onmouseover = function highlightRect() {
        var elem = document.getElementById("rectangle"+id);
        elem.style['background-color'] = getColor(e.type);
    }
    document.getElementById("installment"+id).onmouseout = function highlightRect() {
        var elem = document.getElementById("rectangle"+id);
        elem.style['background-color'] = 'transparent';
    }
}

function getColor(s) {
    if (s == 'Name') {
        c = '#26547c'
    } else if (s == 'Method') {
        c = '#ef476f'
    } else if (s == 'Ingredients') {
        c = '#ffd166'
    } else if (s == 'Picture') {
        c = '#06d6a0'
    }
    return c;
}
