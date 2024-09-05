import { wordList } from "./wordList.js";

let selectedWords = [];
let currentIndex = 0;
let correctAnswers = {};
let correctNumber = 0;
let bingo = true;

const inputs = ["base-form", "third-person", "past-tense", "past-participle", "present-participle"];
const submit = document.getElementById("submit");
const practiceView = document.getElementById('practice-view');
const inputContainer = document.getElementById('input-container');

// 初始化页面
function init() {
    practiceView.classList.remove('hidden');
    practiceView.classList.add('fade-in');

    getRandomWords();
    createCircles();
    displayWord();
    submit.addEventListener("click", function () {
        if (submit.textContent === "提交") {
            checkAnswer();
        }
        else if (submit.textContent === "下一个") {
            nextWord();
        } else if (submit.textContent === "继续练习") {
            location.reload();
        }
    });

    for (let i = 0; i < inputs.length; i++) {
        document.getElementById(inputs[i]).addEventListener("keydown", function (event) {
            if (event.key === "Enter") {
                let nextInput = null, rememberI = i;
                while (i + 1 !== inputs.length && (nextInput = document.getElementById(inputs[i + 1])).disabled) {
                    i++;
                }

                if (nextInput !== null && !nextInput.disabled) {
                    nextInput.focus();
                } else {
                    checkAnswer();
                }
                i = rememberI;
            } else if (window.getComputedStyle(this).color === "rgb(255, 0, 0)") {
                this.value = "";
                this.style.color = "black";
                feedback.innerHTML = "";
                this.nextElementSibling.style.display = "none";
            }
        });
    }

    this.addEventListener("keydown", function (event) {
        if (event.key === "Enter") {
            if (submit.textContent === "下一个") {
                nextWord();
            } else if (submit.textContent === "继续练习") {
                location.reload();
            }
        }
    }, true)
}

// 创建小圆圈
function createCircles() {
    const circlesContainer = document.getElementById('circles');
    for (let i = 0; i < selectedWords.length; i++) {
        const circle = document.createElement('div');
        circle.classList.add('circle');
        circlesContainer.appendChild(circle);
    }
}

// 更新小圆圈的状态
function updateCircles(index, singal) {
    const circles = document.querySelectorAll('.circle');

    circles[index].classList.remove('active');
    // current 5; check 6
    if (singal === 5) {
        circles[index].classList.add('active');
    } else if (singal === 6 && selectedWords[index] === '✔') {
        circles[index].classList.add('completed');
    }
}

// 获取URL参数
function getQueryParameter(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

// 随机选择10个单词
function getRandomWords() {
    const maxNumber = parseInt(getQueryParameter('words')) || 10; // 默认为10个单词;
    const keys = Object.keys(wordList);
    while (selectedWords.length < maxNumber) {
        const randomKey = keys[Math.floor(Math.random() * keys.length)];
        if (!selectedWords.includes(randomKey)) {
            selectedWords.push(randomKey);
        }
    }
}

// 显示当前单词的中文释义和当前单词的序号
function displayWord() {
    // 跳过已经正确的单词
    while (selectedWords[currentIndex] === "✔" && correctNumber !== selectedWords.length) {
        currentIndex = (currentIndex + 1) % selectedWords.length;
    }

    if (correctNumber !== selectedWords.length) {
        const chineseMeaning = wordList[selectedWords[currentIndex]].chinese;
        correctAnswers = wordList[selectedWords[currentIndex]].forms;
        document.getElementById("chinese-meaning").textContent = chineseMeaning;
        document.getElementById("word-counter").textContent = `${currentIndex + 1} / ${selectedWords.length}`;
        document.getElementById("feedback").textContent = "";
        updateCircles(currentIndex, 5);
    } else {
        document.getElementById(inputs[0]).blur();
        document.getElementById("feedback").innerHTML = "恭喜你，成功通关！";
        document.getElementById("feedback").style.color = "green";
    }
}

// 检查用户输入
function checkAnswer() {
    const baseFormInput = document.getElementById(inputs[0]).value.trim().toLowerCase();
    const thirdPersonInput = document.getElementById(inputs[1]).value.trim().toLowerCase();
    const pastTenseInput = document.getElementById(inputs[2]).value.trim().toLowerCase();
    const pastParticipleInput = document.getElementById(inputs[3]).value.trim().toLowerCase();
    const presentParticipleInput = document.getElementById(inputs[4]).value.trim().toLowerCase();
    const feedback = document.getElementById("feedback");

    let correct = [baseFormInput === correctAnswers.baseForm,
    thirdPersonInput === correctAnswers.thirdPerson,
    pastTenseInput === correctAnswers.pastTense,
    pastParticipleInput === correctAnswers.pastParticiple,
    presentParticipleInput === correctAnswers.presentParticiple];

    let inputElement, correctIconElement, wrongIconElement;
    for (let i = 0; i < inputs.length; i++) {
        inputElement = document.getElementById(inputs[i]);

        if (correct[i]) {
            inputElement.disabled = true;
            inputElement.style.color = "green";
            correctIconElement = inputElement.nextElementSibling.nextElementSibling;
            correctIconElement.style.display = 'inline';
        } else {
            wrongIconElement = inputElement.nextElementSibling;
            wrongIconElement.style.display = 'inline';
            // 移除抖动效果
            inputElement.classList.remove('shake');
            // 强制浏览器重绘
            void inputElement.offsetWidth;
            // 再次添加抖动效果
            inputElement.classList.add('shake');
            inputElement.style.color = "red";
        }
        inputElement.blur();
    }

    if (correct.every(c => c)) {
        if (bingo) {
            selectedWords[currentIndex] = "✔"; // 将正确的单词替换为 ✔
            correctNumber++;
        }

        if (correctNumber !== selectedWords.length) {
            submit.textContent = "下一个";
        } else {
            submit.textContent = "继续练习";
        }

        updateCircles(currentIndex, 6);
    } else {
        bingo = false;
        feedback.innerHTML = `错误，请修正！<br>答案: ${correctAnswers.baseForm}-${correctAnswers.thirdPerson}-${correctAnswers.pastTense}-${correctAnswers.pastParticiple}-${correctAnswers.presentParticiple}`;
        feedback.style.color = "red";
    }
}

function nextWord() {
    let inputElement, correctIconElement;
    // 添加淡出效果
    inputContainer.classList.add('fade-out');
    setTimeout(() => {
        for (let i = 0; i < inputs.length; i++) {
            inputElement = document.getElementById(inputs[i]);
            inputElement.value = "";
            inputElement.disabled = false;
            inputElement.style.color = "black";
            correctIconElement = inputElement.nextElementSibling.nextElementSibling;
            correctIconElement.style.display = 'none';
        }

        submit.textContent = "提交";
        currentIndex = (currentIndex + 1) % selectedWords.length;
        bingo = true;
        document.getElementById(inputs[0]).focus();

        // 更新内容
        displayWord();

        // 添加淡入效果
        inputContainer.classList.remove('fade-out');
        inputContainer.classList.add('fade-in');

        // 移除fade-in类，避免后续切换时影响动画
        setTimeout(() => inputContainer.classList.remove('fade-in'), 200);
    }, 200); // 等待淡出动画完成
}

window.onload = init;