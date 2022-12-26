import React, { useRef, useState, useEffect } from "react";
import Moveable from "react-moveable";

const App = () => {
    const [moveableComponents, setMoveableComponents] = useState([]);
    const [selected, setSelected] = useState(null);
    const [imgsArr, setImgsArr] = useState([]);

    useEffect(() => {
        getImages();
    }, []);

    //fetch API objects
    const getImages = async () => {
        const response = await fetch(
            "https://jsonplaceholder.typicode.com/photos"
        );
        const responseJSON = await response.json();
        setImgsArr(responseJSON);
    };

    const addMoveable = () => {
        // Create a new moveable component and add it to the array
        const COLORS = ["red", "blue", "yellow", "green", "purple"];
        const OBJ_FITS = ["fill", "contain", "cover", "none", "scale-down"];

        function generateUniqueRandom() {
            //Generate random number
            let random = Math.floor(Math.random() * imgsArr.length);
            const found = moveableComponents.some((el) => el.id === random);

            //avoid duplicated numbers
            if (!found) {
                return random;
            } else {
                generateUniqueRandom();
            }
        }

        const num = generateUniqueRandom();
        const img = imgsArr[num];

        setMoveableComponents([
            ...moveableComponents,
            {
                id: img.id,
                top: 0,
                left: 0,
                width: 100,
                height: 100,
                color: COLORS[Math.floor(Math.random() * COLORS.length)],
                imgUrl: img.url,
                objFit: OBJ_FITS[Math.floor(Math.random() * OBJ_FITS.length)],
                updateEnd: true,
            },
        ]);
    };


    //remove elements function
    const removeMovable = (id) => {
        setMoveableComponents((current) =>
            current.filter((object) => {
                // 👇️ remove object that has id equal to 2
                return object.id !== selected;
            })
        );
    };

    const updateMoveable = (id, newComponent, updateEnd = false) => {
        const updatedMoveables = moveableComponents.map((moveable, i) => {
            if (moveable.id === id) {
                return { id, ...newComponent, updateEnd };
            }
            return moveable;
        });
        setMoveableComponents(updatedMoveables);
    };

    const handleResizeStart = (index, e) => {
        console.log("e", e.direction);
        // Check if the resize is coming from the left handle
        const [handlePosX, handlePosY] = e.direction;
        // 0 => center
        // -1 => top or left
        // 1 => bottom or right

        // -1, -1
        // -1, 0
        // -1, 1
        if (handlePosX === -1) {
            console.log("width", moveableComponents, e);
            // Save the initial left and width values of the moveable component
            const initialLeft = e.left;
            const initialWidth = e.width;

            // Set up the onResize event handler to update the left value based on the change in width
        }
    };

    return (
        <main style={{ height: "100vh", width: "100vw" }}>
            <button onClick={addMoveable}>Add Moveable1</button>
            <button onClick={() => removeMovable(selected)}>
                Remove Moveable
            </button>
            {/* {console.log(imgsArr)} */}
            <div
                id="parent"
                style={{
                    position: "relative",
                    background: "black",
                    height: "80vh",
                    width: "80vw",
                    overflow:"hidden"
                }}
            >
                {moveableComponents.map((item, index) => (
                    <Component
                        {...item}
                        key={index}
                        updateMoveable={updateMoveable}
                        handleResizeStart={handleResizeStart}
                        setSelected={setSelected}
                        isSelected={selected === item.id}
                    />
                ))}
            </div>
        </main>
    );
};

export default App;

const Component = ({
    updateMoveable,
    top,
    left,
    width,
    height,
    index,
    color,
    imgUrl,
    objFit,
    id,
    setSelected,
    isSelected = false,
    updateEnd,
}) => {
    const ref = useRef();

    const [nodoReferencia, setNodoReferencia] = useState({
        top,
        left,
        width,
        height,
        index,
        color,
        objFit,
        imgUrl,
        id,
    });

    let parent = document.getElementById("parent");
    let parentBounds = parent?.getBoundingClientRect();

    const onResize = async (e) => {
        // ACTUALIZAR ALTO Y ANCHO
        let newWidth = e.width;
        let newHeight = e.height;

        const positionMaxTop = newHeight;
        const positionMaxLeft = newWidth;

        if (positionMaxTop > parentBounds?.height)
            newHeight = parentBounds?.height - top;
        if (positionMaxLeft > parentBounds?.width)
            newWidth = parentBounds?.width - left;

        updateMoveable(id, {
            top,
            left,
            width: newWidth,
            height: newHeight,
            color,
            imgUrl,
            objFit,
        });

        // ACTUALIZAR NODO REFERENCIA
        const beforeTranslate = e.drag.beforeTranslate;

        ref.current.style.width = `${e.width}px`;
        ref.current.style.height = `${e.height}px`;

        let translateX = beforeTranslate[0];
        let translateY = beforeTranslate[1];

        ref.current.style.transform = `translate(${translateX}px, ${translateY}px)`;

        setNodoReferencia({
            ...nodoReferencia,
            translateX,
            translateY,
            top: top + translateY < 0 ? 0 : top + translateY,
            left: left + translateX < 0 ? 0 : left + translateX,
        });
    };

    const onResizeEnd = async (e) => {
        let newWidth = e.lastEvent?.width;
        let newHeight = e.lastEvent?.height;


        updateMoveable(
            id,
            {
                top,
                left,
                width: newWidth,
                height: newHeight,
                color,
                imgUrl,
                objFit,
            },
            true
        );
    };

    return (
        <>
            <div
                ref={ref}
                className="draggable"
                id={"component-" + id}
                style={{
                    position: "absolute",
                    top: top,
                    left: left,
                    width: width,
                    height: height,
                    // background: color,
                    backgroundImage: `url(${imgUrl})`,
                    objectFit: "cover",
                }}
                onClick={() => setSelected(id)}
            />

            <Moveable
                target={isSelected && ref.current}
                resizable
                draggable
                onDrag={(e) => {
                    updateMoveable(id, {
                        top: e.top,
                        left: e.left,
                        width,
                        height,
                        color,
                        imgUrl,
                        objFit,
                    });
                }}
                onResize={onResize}
                onResizeEnd={onResizeEnd}
                keepRatio={false}
                throttleResize={1}
                renderDirections={["nw", "n", "ne", "w", "e", "sw", "s", "se"]}
                edge={false}
                zoom={1}
                origin={false}
                padding={{ left: 0, top: 0, right: 0, bottom: 0 }}
            />
        </>
    );
};
