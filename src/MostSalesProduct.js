import React, {useState, useEffect, useRef} from 'react';
import Link from '@material-ui/core/Link';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Fade from '@material-ui/core/Fade';
import Title from './Title';

function preventDefault(event) {
    event.preventDefault();
}

const useStyles = makeStyles({
    depositContext: {
        flex: 1,
    },
});

export default function MostSalesProduct() {
    const classes = useStyles();
    const [data, setData] = useState({
        productName:"Loading.."
    });
    const [show, setShow] = useState(true);
    const [isPaused, setIsPaused] = useState(false);
    const [counter, setCounter] = useState(0);
    const ws = useRef(null);

    useEffect(()=>{
        ws.current = new WebSocket("wss://echo.websocket.org");
        ws.current.onopen = () => console.log("ws openened");
        ws.current.onclose = () => console.log("ws closed");        
        return () => {
            ws.current.close();
        }
    },[]);

    useEffect(()=>{
        if (!ws.current) return;
        ws.current.onmessage = e => {
            if (isPaused) return;
            // const message = JSON.parse(e);
            setData({
                productName: e
            })
            console.log("etto",e);
        }
    },[isPaused])

    useEffect(()=>{
        const timer = setTimeout(() => {
            setData({
                productName: "nani "+counter
            });
            setShow(true);
        }, 500);
        return () => clearTimeout(timer);
    },[show])

    const sendMessage = ()=>{
        setCounter(counter+1);
        setShow(false);
    };

    return (
        <React.Fragment>
            <Title>Most Sales Product</Title>
            <Fade in={show}>
                <Typography component="p" variant="h4">
                    {data.productName}
                </Typography>
            </Fade>
            <Typography color="textSecondary" className={classes.depositContext}>
                on 32 December, 2020
            </Typography>
            <div>
                <Link color="primary" href="#" onClick={preventDefault}>
                    View Detail
                </Link>
            </div>
            <button onClick ={sendMessage}>
                Nani
            </button>
        </React.Fragment>
    );
}