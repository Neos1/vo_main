import React, { Component } from "react";
import styles from "./style.scss";

class Hint extends Component {
  constructor(props) {
    super(props);

    this.state = {
      hovered: false,
      posX: 0,
      posY: 0
    };
  }
  handleHover(e) {
    let posX = e.clientX;
    let posY = e.clientY;
    let hovered = true;
    this.setState({ hovered, posX, posY });
  }
  handleOut(e) {
    let posX = e.clientX;
    let posY = e.clientY;
    let hovered = false;
    this.setState({ hovered, posX, posY });
  }

  render() {
    const { data } = this.props;
    const { hovered, posX, posY } = this.state;
    return (
      <div className="hint">
        <span
          className="hint__icon"
          onMouseOver={this.handleHover.bind(this)}
          onMouseLeave={this.handleOut.bind(this)}
        >
          ?
        </span>
        <div
          className={`hint__description ${hovered ? "" : "hidden"}`}
          style={{ left: posX + 20, top: posY - 50 }}
        >
          <p>
            Описание: <br />
            {data.desc}
          </p>
          <p>
            Пример: <br />
            {data.example}
          </p>
        </div>
      </div>
    );
  }
}

export default Hint;
