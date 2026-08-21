import './MoneyFlowChart.css';

const MAX_BAR_HEIGHT = 120;

function MoneyFlowChart({ data }) {
  const maxValue = Math.max(...data.map((d) => Math.max(d.income, d.expense)));

  const toHeight = (value) =>
    Math.round((value / maxValue) * MAX_BAR_HEIGHT);

  return (
    <div className="money-flow">
      <div className="money-flow__header">
        <span className="money-flow__title">💰 Money Flow</span>
        <div className="money-flow__legend">
          <div className="legend-item">
            <div className="legend-item__dot legend-item__dot--income" />
            Income
          </div>
          <div className="legend-item">
            <div className="legend-item__dot legend-item__dot--expense" />
            Expense
          </div>
        </div>
      </div>

      <div className="money-flow__chart">
        {data.map((item) => (
          <div className="bar-group" key={item.month}>
            <div className="bar-group__pair">
              <div
                className="bar bar--income"
                style={{ height: toHeight(item.income) }}
                title={`Income: Rs. ${item.income.toLocaleString()}`}
              />
              <div
                className="bar bar--expense"
                style={{ height: toHeight(item.expense) }}
                title={`Expense: Rs. ${item.expense.toLocaleString()}`}
              />
            </div>
            <span className="bar-group__month">{item.month}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MoneyFlowChart;
