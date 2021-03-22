import * as React from "react";
import style from "./style.module.scss";

//unused so far

function Dialog(props: { message: string }) {
    // onClick={/*close dilog*/}
    return (
        <div className="dialog">
            {props.message}
            <input type="button" value="OK" className={style.Borad__cardsButton}/>
        </div>
    )
}

function Error() {
    return (
        <Dialog message="Plaease enter a phrase first." />
    )
}