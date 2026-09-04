Page({
  data: {
    days: 0,
    quote: ''
  },

  onLoad() {
    const startDate = new Date('2026-06-07');
    const today = new Date();
    const diffTime = today - startDate;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    const quotes = [
      '今天也要开心哦 ✨',
      '你穿什么都好看 💕',
      '你是最可爱的 🎀',
      '今天会是很棒的一天 🌸',
      '每一件裙子都在等你 🧡'
    ];
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];

    this.setData({
      days: diffDays,
      quote: randomQuote
    });

    

    setTimeout(() => {
      wx.navigateTo({
        url: '/pages/home/home'
      });
    }, 2500);
  }
})