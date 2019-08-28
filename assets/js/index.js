import {visualize} from './visualize.js';
import {meta} from './bibleMeta';
import "../css/style.css";
import academia from '../imgs/academia.ico';
import github from '../imgs/github.png';


//global object, see index.html
const sefaria = Sefaria;

// Elements
const btn = document.querySelector('#btn');
const bibleBook = document.querySelector('#book');
const bibleChap = document.querySelector('#chapter');
const bibleVers = document.querySelector('#verse');
const firstOptions = document.querySelector('#firstOpts');
const secondOptions = document.querySelector('#secOpts');
const buildDate = document.querySelector('#build-date');
const academiaAnc = document.querySelector('#academia-anc');
const githubAnc = document.querySelector('#github-anc');

// set images
const acaIcon = new Image();
const gitIcon = new Image();
acaIcon.src = academia;
acaIcon.classList.add('icon');
academiaAnc.appendChild(acaIcon);
gitIcon.src = github;
gitIcon.classList.add('icon');
githubAnc.appendChild(gitIcon);

// set last updated date
const date = new Date();
const latest = `${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()}`;
buildDate.innerText = latest;

// =========== LOGIC ========= //
const configureDD2 = (ddl, index) => {
    if(ddl.options.length) {
        while (ddl.options.length) {
            ddl.remove(0)
        }
    }
    ddl.insertAdjacentHTML('beforeend', `<option value=""></option>`);
    meta[index].chapters.forEach(chap => {
        ddl.insertAdjacentHTML('beforeend', `<option value="${chap.number}">${chap.number}</option>`);
    })
}

const configureDD3 = (ddl, bookIndex, chapIndex) => {
    let book = meta[bookIndex];
    let index = parseInt(chapIndex)-1
    let chap = book.chapters[index];
    if(ddl.options.length) {
        while (ddl.options.length) {
            ddl.remove(0)
        }
    }
    ddl.insertAdjacentHTML('beforeend', `<option value=""></option>`);
    if (chap) {
        [...Array.from({length: chap.verses}, (v, k) => k+1)].forEach(num => {
            ddl.insertAdjacentHTML('beforeend', `<option value="${num}">${num}</option>`);
        })   
    }
}

const formatRef = (book, chapter, verse) => {
    let v = verse ? ':' + verse : verse;
    let ref = `${book} ${chapter}${v}`.trim();
    return ref;
}

// populates book drop down from meta
meta.forEach(book => {
    bibleBook.insertAdjacentHTML('beforeend', `<option value="${book.book}">${book.book}</option>`);
})

// calling here ensures that bibleChap is loaded for Genesis
configureDD2(bibleChap, bibleBook.options[bibleBook.selectedIndex].index);

bibleBook.addEventListener("change", () => {
    configureDD2(bibleChap, bibleBook.options[bibleBook.selectedIndex].index)
} , false);

bibleChap.addEventListener("change", () => {
    configureDD3(bibleVers, bibleBook.options[bibleBook.selectedIndex].index, bibleChap.options[bibleChap.selectedIndex].value)
} , false);

btn.addEventListener('click', () => {
    let book = bibleBook.options[bibleBook.selectedIndex].value;
    let chap = bibleChap.options[bibleChap.selectedIndex].value;
    let verse = bibleVers.options[bibleVers.selectedIndex].value;
    let ref = formatRef(book, chap, verse);
    let firstOpts = {category: firstOptions.options[firstOptions.selectedIndex].value};
    let secondOpts = {category: secondOptions.options[secondOptions.selectedIndex].value};
    visualize(sefaria, ref, firstOpts, secondOpts);
});
