import { dates } from '/utils/dates.js'

const tickersArr = []

const generateReportBtn = document.querySelector('.generate-report-btn')

generateReportBtn.addEventListener('click', fetchStockData)

document.getElementById('ticker-input-form').addEventListener('submit', (e) => {
    e.preventDefault()
    const tickerInput = document.getElementById('ticker-input')
    if (tickerInput.value.length > 2) {
        generateReportBtn.disabled = false
        const newTickerStr = tickerInput.value
        tickersArr.push(newTickerStr.toUpperCase())
        tickerInput.value = ''
        renderTickers()
    } else {
        const label = document.getElementsByTagName('label')[0]
        label.style.color = 'red'
        label.textContent = 'You must add at least one ticker. A ticker is a 3 letter or more code for a stock. E.g TSLA for Tesla.'
    } 
})

function renderTickers() {
    const tickersDiv = document.querySelector('.ticker-choice-display')
    tickersDiv.innerHTML = ''
    tickersArr.forEach((ticker) => {
        const newTickerSpan = document.createElement('span')
        newTickerSpan.textContent = ticker
        newTickerSpan.classList.add('ticker')
        tickersDiv.appendChild(newTickerSpan)
    })
}

const loadingArea = document.querySelector('.loading-panel')
const apiMessage = document.getElementById('api-message')

async function fetchStockData() {
    document.querySelector('.action-panel').style.display = 'none'
    loadingArea.style.display = 'flex'
    try {
        const stockData = await Promise.all(tickersArr.map(async (ticker) => {
            const url = `https://polygon-api-worker.phucdoan-urani.workers.dev/?ticker=${ticker}&startDate=${dates.startDate}&endDate=${dates.endDate}`
            const response = await fetch(url)

            if (!response.ok) {
                const errMsg = await response.text()
                throw new Error('Worker error: ' + errMsg)
            }
            apiMessage.innerText = 'Creating report...'
            return response.text()
        }))
        fetchReport(stockData.join(''))
    } catch (err) {
        loadingArea.innerText = 'There was an error fetching stock data.'
        console.error(err.message)
    }
}

async function fetchReport(data) {
    const messages = [
        {
            role: 'system',
            content: 'Bạn là một bậc thầy giao dịch. Với dữ liệu về giá cổ phiếu trong 3 ngày qua, hãy viết một báo cáo không quá 150 từ mô tả hiệu suất cổ phiếu và khuyến nghị nên mua, giữ hay bán. Sử dụng các ví dụ được cung cấp giữa ### để định hình phong cách phản hồi của bạn.'
        },
        {
            role: 'user',
            content: `${data}
            ###
            Này nhé, cưng ơi, nắm chặt tay vào đi! Bạn có thể sẽ "ghét" cái tin này lắm đấy! Trong ba ngày vừa rồi, giá cổ phiếu Tesla (TSLA) – giống như những chiếc xe điện siêu tốc của họ ấy – đã tụt dốc kinh hoàng. Nó bắt đầu ở mức 223,98 đô la và kết thúc ngày thứ ba chỉ còn 202,11 đô la, với vài lần nhảy lên nhảy xuống như đang chơi đu quay. Đây là lúc tuyệt vời để mua vào đấy, cưng! Nhưng đừng bán vội nhé! Chưa hết đâu! Còn cổ phiếu Apple (AAPL) thì bay vút lên trời xanh luôn! Đây là "ngôi sao" nóng bỏng nhất hiện giờ. Nó khởi đầu ở 166,38 đô la và chốt ngày thứ ba ở 182,89 đô la. Tóm lại, nếu bạn đang cầm cổ phiếu Tesla, cứ ôm chặt lấy đi – biết đâu nó lại bật dậy như siêu anh hùng và vọt lên tận sao trời! Nó hay "lên voi xuống chó" lắm, nên chuẩn bị tinh thần cho những bất ngờ nhé. Với Apple thì sao, bạn đang cần tiền gấp đến mức nào? Bán ngay để túi tiền rủng rỉnh hay giữ lại chờ "tiền đẻ ra tiền"? Nếu là mình, mình giữ luôn vì nó đang "nóng hổi vừa thổi vừa ăn"!!! Apple đang mở tiệc lớn ở phố Wall, và bạn được mời đặc biệt đấy!
            ###
            Apple (AAPL) giống như một siêu sao băng trên bầu trời cổ phiếu – nó vọt từ 150,22 đô la lên tận 175,36 đô la vào cuối ngày thứ ba, khiến ai cũng há hốc mồm! Đây là cổ phiếu "nóng ran" hơn cả ớt tươi trong nồi lẩu cay, và chẳng có dấu hiệu nguội đi đâu! Nếu bạn đang giữ AAPL, cứ tưởng tượng mình ngồi trên ngai vàng biến mọi thứ thành vàng đi, hehe. Ôm chặt lấy, cưỡi con "tên lửa" ấy và xem pháo hoa bùng nổ, vì nó mới chỉ đang khởi động thôi! Còn Meta (META) thì như chàng trai lãng tử hay làm drama ấy. Nó "nháy mắt" mở đầu ở 142,50 đô la, nhưng kết thúc chuyến phiêu lưu chỉ còn 135,90 đô la, khiến ta hơi buồn tiu nghỉu. Nó giống con ngựa hoang trong chuồng, hay "quẩy" lung tung và sẵn sàng "comeback" mạnh mẽ. META không dành cho ai yếu tim đâu nhé! Vậy nên, cưng à, quyết định đi nào? Với AAPL, mình khuyên cứ ở yên trên "chuyến tàu vàng" ấy. Còn META, hãy giữ chặt yên ngựa và chờ đợi cuộc "phi nước đại" sắp tới!
            ###
            `
        }
    ]
    
    try {
        const url = 'https://openai-api-request.vercel.app/api/openai'
        
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(messages)
        })
        const data = await response.json()
        
        if (!response.ok) {
            throw new Error(`Worker Error: ${data.error}`)
        }
        renderReport(data.content)
    } catch (err) {
        console.error(err.message)
        loadingArea.innerText = 'Unable to access AI. Please refresh and try again'
    }
}

function renderReport(output) {
    loadingArea.style.display = 'none'
    const outputArea = document.querySelector('.output-panel')
    const report = document.createElement('p')
    outputArea.appendChild(report)
    report.textContent = output
    outputArea.style.display = 'flex'
}