//Sorting Class ====================================================================================
class Sorting_List {
    //Constructors/Destructors ---------------------------------------------------------------------
    constructor(canvas, elements=[], time_step=10,
            nom_color="green", highlight_color="orange", shade_color="#8090A0", mod_color="yellow") {
        //Init elements
        this.original = Array.from(elements);
        this.elements = elements;
        this.head_end = 0;
        this.bars = [];
        this.queue = new Queue();
        this.init(elements);

        //Speed control
        this.time_step = time_step; //ms

        //Link to canvas
        this.canvas = canvas;
        this.context = canvas.getContext("2d");

        //Formatting - colors
        this.nom_color = nom_color;
        this.highlight_color = highlight_color;
        this.shade_color = shade_color;
        this.mod_color = mod_color;

        //Formatting - sizing
        this.border_margin = 5;
        this.top_margin = 10;
        this.bar_margin_percent = 15;
        this.font_thres = 5; //pt
        this.element_max = Math.max.apply(Math, elements);
        this.element_width = 0;
        this.element_max_height = 0;
        this.margin_width = 0;

        //Rescale and draw
        this.resize();        
        this.draw();
    }

    //Data management methods ----------------------------------------------------------------------
    init(bars) {
        this.bars = [];
        for(let i=0; i<bars.length; ++i) {
            this.bars.push(new Element(bars[i], this.nom_color));
        }
    }

    reset() {
        this.elements = Array.from(this.original);
        this.init(this.original);
        this.queue.clear();

        //Rescale and draw
        this.resize();        
        this.draw();
    }

    set_elements(array) {
        this.original = Array.from(array);
        this.elements = array;
        this.reset();
    }

    set_random(length, max_val=length) {
        var array = Array.from({length: length}, () => Math.ceil(Math.random() * max_val));
        this.set_elements(array);
    }

    set_ascending(length) {
        var array = Array.from(Array(length+1).keys());
        array.shift();
        this.shuffle(array);
        this.set_elements(array);
    }

    shuffle(array) {
        var i = array.length;
        var r = 0;
      
        while (i != 0) {      
          // Pick a remaining element and swap with current
          r = Math.floor(Math.random() * i);
          --i;
          [array[i], array[r]] = [array[r], array[i]];
        }
    }

    //Getters/Setters ------------------------------------------------------------------------------
    set_canvas(canvas) {
        this.canvas = canvas;
        this.context = canvas.getContext("2d");
    }
    set_time_step(time_step) {
        this.time_step = time_step;
    }

    set_nom_color(color) {
        this.nom_color = color;
    }

    set_highlight_color(color) {
        this.highlight_color = color;
    }

    set_shade_color(color) {
        this.shade_color = color;
    }

    set_mod_color(color) {
        this.mod_color = color;
    }

    get_length() {
        return this.elements.length;
    }

    //Scaling --------------------------------------------------------------------------------------
    resize() {
        var width = (this.canvas.width - 2*this.border_margin)/this.bars.length;
        this.margin_width = width*this.bar_margin_percent/100;
        this.element_width = width - this.margin_width;
        this.element_max_height = this.canvas.height - 2*this.border_margin- this.top_margin;
        this.element_max = Math.max.apply(Math, this.original);
    }

    //Coloring methods -----------------------------------------------------------------------------
    recolor(color=this.nom_color) {
        for(let i=0; i<this.bars.length; ++i) {
            this.bars[i].color = color;
        }
    }

    color(i, color=this.nom_color, last=undefined, last_color=this.nom_color) {
        this.bars[i].color = color;
        if(this.last != undefined) {
            this.bars[last].color = last_color;
        }
    }
    
    //Draw methods ---------------------------------------------------------------------------------
    clear_screen() {
        this.context.clearRect(0,0,this.canvas.width,this.canvas.height);
    }

    draw() {
        this.clear_screen();
        for(let i=0; i<this.bars.length; ++i) {
            var x = this.border_margin + i*(this.element_width + this.margin_width);
            this.draw_bar(i,x);
        }
    }

    draw_bar(i,x) {
        var y = this.border_margin + this.top_margin + this.element_max_height*(1 - this.bars[i].value/ this.element_max)
        var height = this.element_max_height*(this.bars[i].value / this.element_max);

        this.context.fillStyle = this.bars[i].color;
        this.context.fillRect(x, y, this.element_width, height);
        
        this.context.fillStyle = "black";
        this.context.textAlign = "center";
        var pt = Math.floor(this.element_width/2);
        if(pt >= this.font_thres) {
            this.context.font = pt.toString() + "pt Arial";
            this.context.fillText(this.bars[i].value, x + this.element_width/2, y-2, this.element_width);
        }
    }

    //Compare methods ------------------------------------------------------------------------------
    highlight(i,j=undefined) {
        this.queue.enqueue([Instruction.highlight,i,j]);
    }

    less_than(i,j) {
        this.highlight(i,j);
        return this.elements[i] < this.elements[j];
    }
    less_than_or_equal(i,j) {
        this.highlight(i,j);
        return this.elements[i] <= this.elements[j];
    }
    greater_than(i,j) {
        this.highlight(i,j);
        return this.elements[i] > this.elements[j];
    }
    greater_than_or_equal(i,j) {
        this.highlight(i,j);
        return this.elements[i] >= this.elements[j];
    }
    equal_to(i,j) {
        this.highlight(i,j);
        return this.elements[i] == this.elements[j];
    }
    not_equal_to(i,j) {
        this.highlight(i,j);
        return this.elements[i] != this.elements[j];
    }

    //Swap/Set methods -----------------------------------------------------------------------------
    swap(i,j) {
        this.queue.enqueue([Instruction.swap,i,j]);
        let temp = this.elements[i];
        this.elements[i] = this.elements[j];
        this.elements[j] = temp;
    }

    bar_swap(i,j) {
        let temp = this.bars[i];
        this.bars[i] = this.bars[j];
        this.bars[j] = temp;
    }

    set(i, value) {
        this.queue.enqueue([Instruction.set,i,value]);
        this.elements[i] = value;
    }

    bar_set(i, value) {
        this.bars[i].value = value;
    }

    //Sorting help methods -------------------------------------------------------------------------
    compute_sort() {
        throw("sort() not implemented in abstract class");
    }

    complete() {
        this.queue.enqueue(Instruction.complete);
        this.animate();
    }

    //Animation ------------------------------------------------------------------------------------
    animate() {
        this.recolor(this.shade_color);

        const id = setInterval(() => {
            this.clear_screen()

            if(this.queue.is_empty()) {
                clearInterval(id);
            }

            let instruction = this.queue.dequeue();
            switch(instruction[0]) {
                case Instruction.highlight:
                    this.recolor(this.shade_color);
                    this.color(instruction[1], this.highlight_color);
                    if(instruction[2] != undefined) {
                        this.color(instruction[2], this.highlight_color);
                    }
                    break;

                case Instruction.swap:
                    this.bar_swap(instruction[1], instruction[2])
                    break;

                case Instruction.set:
                    this.recolor(this.shade_color);
                    this.bar_set(instruction[1], instruction[2]);
                    this.color(instruction[1], this.mod_color);
                    break;

                case Instruction.complete:
                default:
                    clearInterval(id);
                    this.recolor(this.nom_color);
            }

            this.draw();
        }, this.time_step);
    }

    //Sorting methods ------------------------------------------------------------------------------
    //Bubblesort ---------------------------------------------------------------
    bubblesort() {
        this.reset();

        for(let j=this.elements.length; j>0; --j) {
            let sorted = true;
            for(let i=1; i<j; ++i) {
                if(this.less_than(i,i-1)) {
                    this.swap(i,i-1);
                    sorted = false;
                }
            }
            if(sorted) {
                break;
            }
        }

        this.complete();
    }

    //pingpongsort -----------------------------------------------------------------
    pingpongsort() {
        this.reset();
        var ascend = true;
        var left = 0;
        var right = this.elements.length-1;

        while(left < right) {
            let sorted = true;
            if(ascend) {
                for(let i=left+1; i<=right; ++i) {
                    if(this.less_than(i,i-1)) {
                        this.swap(i,i-1);
                        sorted = false;
                    }
                }
                --right;
                ascend = !ascend;
            }
            else {
                for(let i=right-1; i>=left; --i) {
                    if(this.less_than(i+1,i)) {
                        this.swap(i,i+1)
                        sorted = false;
                    }
                }
                ++left;
                ascend = !ascend;
            }
            if(sorted) {
                break;
            }
        }

        this.complete();
    }

    //Selectionsort ------------------------------------------------------------
    selectionsort() {
        this.reset();

        for(let i=0; i<this.elements.length; ++i) {
            let min_index = i;
            for(let j=i; j<this.elements.length; ++j) {
                if(this.less_than(j,min_index)) {
                    min_index = j;
                }
            }
            if(i != min_index) {
                this.swap(i,min_index);
            }
        }

        this.complete();
    }

    //Insertionsort ------------------------------------------------------------
    insertionsort() {
        this.reset();

        for(let i=0; i<this.elements.length; ++i) {
            for(let j=i; j>0; --j) {
                if(this.less_than(j-1,j)) {
                    break;
                }
                else {
                    this.swap(j,j-1);
                }
            }
        }

        this.complete();
    }

    //Shellsort ----------------------------------------------------------------
    shellsort() {
        this.reset();

        var gap = Math.floor((this.elements.length)/2);
        while(gap > 0) {
            for(let i=0; (i+gap)<this.elements.length; ++i) {
                var j = i;
                while(j >= 0) {
                    if(this.less_than(j+gap,j)) {
                        this.swap(j,j+gap);
                        j -= gap;
                    }
                    else {
                        break;
                    }
                }
            }

            //Prepare next
            gap = Math.floor(gap/2);
        }

        this.complete();
    }

    //Quicksort ----------------------------------------------------------------
    quicksort() {
        this.reset();

        this.quicksort_r(0, this.elements.length-1);

        this.complete();
    }

    quicksort_r(a, b) {
        //Base cases
        if(b-a == 1) { //2-elements
            if(this.less_than(b,a)) {
                this.swap(a,b);
            }
            return;
        }
        else if(b-a <= 0) { //1-element or invalid indexing
            return;
        }

        //Variables
        var pivot = this.elements[b];
        var i = a-1;
        
        //Scan and swap
        for(let j=a; j<=b-1; ++j) {
            this.highlight(i+1,j);
            if(this.elements[j] <= pivot) {
                ++i;
                this.swap(i,j);
            }
        }
        this.swap(i+1,b);

        //Next recursive call
        this.quicksort_r(a,i);
        this.quicksort_r(i+2,b);
        return;
    }

    //Mergesort ----------------------------------------------------------------
    mergesort() {
        this.reset();

        this.mergesort_r(0, this.elements.length-1);

        this.complete();
    }

    mergesort_r(a, b) {
        //Base cases
        if(b-a == 1) { //2-elements
            if(this.less_than(b,a)) {
                this.swap(a,b);
            }
            return;
        }
        else if(b-a <= 0) { //1-element or invalid indexing
            return;
        }

        //Midpoint
        var mid = Math.floor((a+b)/2);
        var i = a;
        var j = mid+1;
   
        //Recursive calls
        this.mergesort_r(a,mid);
        this.mergesort_r(mid+1,b);

        //Sub arrays
        var A = new Queue(this.elements.slice(a,mid+1));
        var B = new Queue(this.elements.slice(mid+1,b+1));

        //Merge
        var temp = new Queue();
        while(!A.is_empty() && !B.is_empty()) {
            this.highlight(i,j);
            if(A.peek() <= B.peek()) {
                temp.enqueue(A.dequeue());
                ++i;
            }
            else {
                temp.enqueue(B.dequeue());
                ++j;
            }
        }
        while(!A.is_empty()) {
            temp.enqueue(A.dequeue());
        }
        while(!B.is_empty()) {
            temp.enqueue(B.dequeue());
        }

        i = a;
        while(!temp.is_empty()) {
            this.set(i, temp.dequeue());
            ++i;
        }
        
        return;
    }

    //Heapsort -----------------------------------------------------------------
    heapsort() {
        this.reset();
        this.heap_end = this.elements.length-1;

        this.heapify();
        while(this.heap_pop()) {}

        this.complete();
    }

    heap_empty() {
        if(this.heap_end < 0) {
            return true;
        }
        else {
            return false;
        }
    }

    heap_pop() {
        if(this.heap_empty()) {
            return false;
        }
        else {
            this.swap(0,this.heap_end);
            this.heap_end--;
            this.sift_down(0);

            return true;
        }
    }

    heapify() {
        for(let i=this.heap_end; i>=0; --i) {
            this.sift_down(i);
        }
    }

    sift_down(i) {
        //Find child index
        var child = 2*i + 1;

        //Case: No children
        if(child > this.heap_end) {
            return;
        }

        //Case: 2-children (find largest)
        if(child+1 <= this.heap_end) {
            if(this.greater_than(child+1,child)) {
                ++child;
            }
        }

        //Check if swap needed
        if(this.greater_than(child,i)) {
            this.swap(i,child);

            this.sift_down(child);
        }
        else {
            return;
        }
    }

    //Radixsort ----------------------------------------------------------------
    radixsort() {
        this.reset();

        var max_val = Math.max.apply(Math, this.elements);
        var exp = 1;
        while(max_val/exp >= 1) {
            this.counting_sort(exp);
            exp *= 10;
        }
        this.complete();
    }

    counting_sort(exp) {
        var temp = Array(this.elements.length);
        var count = Array(10).fill(0);

        //Count occurrences of digit at exp
        for(let i=0; i<this.elements.length; ++i) {
            this.highlight(i);
            let index = Math.floor(this.elements[i]/exp);
            count[index % 10] += 1;
        }

        //Adjust to total count
        for(let i=1; i<10; ++i) {
            count[i] += count[i-1];
        }

        //Sort array
        for(let i=this.elements.length-1; i>=0; --i) {
            let index = Math.floor(this.elements[i]/exp);
            temp[count[index % 10] - 1] = this.elements[i];
            count[index % 10] -= 1;
        }
        for(let i=0; i<this.elements.length; ++i) {
            this.set(i, temp[i]);
        }
    }
}

//Bar Element ======================================================================================
class Element {
    //Constructors/Destructors
    constructor(value, color="green") {
        this.value = value;
        this.color = color;
    }

    //Methods
    valueOf() {
        return this.value;
    }
}

//Instruction enum =================================================================================
const Instruction = {
    highlight: "highlight",
    swap: "swap",
    set: "set",
    complete: "complete"
}

//Queue ============================================================================================
class Queue {
    //Constructors/Destructors
    constructor(values=[]) {
        this.data = [];
        if(Array.isArray(values)) {
            this.data = values;
        }
        else {
            this.data[0] = values;
        }
    }

    enqueue(value) {
        this.data.push(value);
    }

    dequeue() {
        if(this.data.length > 0) {
            return this.data.shift();
        }
        else {
            return false;
        }
    }

    peek() {
        return this.data[0];
    }

    is_empty() {
        if(this.data.length == 0) {
            return true;
        }
        else {
            return false;
        }
    }

    clear() {
        this.data = [];
    }
}

//Interface control ================================================================================
function init_input(input, default_value=50) {
    if(!input.value) {
        input.value = default_value;
    }
    else if(parseInt(input.value) > input.max) {
        input.value = input.max;
    }
    else if(parseInt(input.value) < input.min) {
        input.value = input.min;
    }
    return parseInt(input.value);
}

(function(window, document, undefined) {
    //Link to html elements
    const canvas = document.getElementById("sorting_canvas");
    const sorting_select = document.getElementById("sorting_select");
    const speed_slider = document.getElementById("speed_slider");
    const length_input = document.getElementById("array_size_input");
    const generate_button = document.getElementById("generate_button");
    const reset_button = document.getElementById("reset_button");
    const sort_button = document.getElementById("sort_button");

    //Variables
    var size = parseInt(length_input.value);

    //Initialize sorting object
    const list = new Sorting_List(canvas);
    list.set_ascending(parseInt(length_input.value));

    //Click out of input
    document.addEventListener("click", function(event) {
        if(!length_input.contains(event.target)) {
            init_input(length_input);
        }
    });

    //Generate button
    generate_button.addEventListener("click", () => {
        init_input(length_input);
        
        //Reset list
        size = parseInt(length_input.value);
        list.set_ascending(parseInt(length_input.value));
    });

    //Reset button
    reset_button.addEventListener("click", () => {
        list.reset();
    });

    //Sort button
    sort_button.addEventListener("click", () => {
        init_input(length_input);
        list.set_time_step(speed_slider.max - speed_slider.value);

        //Reset if input was changed
        if(size != parseInt(length_input.value)) {
            size = parseInt(length_input.value);
        list.set_ascending(size);
        }

        //Call sorting method
        switch(sorting_select.value) {   
        case "bubblesort":
                list.bubblesort();
                break;
            case "pingpongsort":
                list.pingpongsort();
                break;
            case "selectionsort":
                list.selectionsort();
                break;
            case "insertionsort":
                list.insertionsort();
                break;
            case "shellsort":
                list.shellsort();
                break;
            case "quicksort":
                list.quicksort();
                break;
            case "mergesort":
                list.mergesort();
                break;
            case "heapsort":
                list.heapsort();
                break;
            case "radixsort":
                list.radixsort();
                break;
            default:
                break; 
        }
    });
} )(window, document, undefined);