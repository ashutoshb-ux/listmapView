// @ts-nocheck
import { Wrapper } from "@googlemaps/react-wrapper";
import { useRef, useEffect, useState, useMemo, MouseEvent } from "react";
import { createRoot } from "react-dom/client";
import { Clusters } from "./types";
import { getFlattenedData, getPolylinesData } from "./functionss";
import { Tooltip } from "@mui/material";
import Typography from "@mui/material/Typography";
type Props = {
  data: Clusters | null;
};
// old key : AIzaSyCf2_txZACzBqNY99vHR1YWdbExpCuQ_Lg
export default function GoogleMaps({ data }: Props) {
  return (
    <Wrapper
      apiKey={"AIzaSyDf-xititY3lMRyp7rgDNxH_6h3YI3D1og"}
      version="beta"
      libraries={["marker"]}
    >
      <MyMap data={data} />
    </Wrapper>
  );
}

const mapOptions = {
  mapId: "DEMO_MAP_ID",
  center: { lat: 24.6628595, lng: 77.3348837 },
  zoom: 10,
  disableDefaultUI: true,
};

function MyMap({ data }: Props) {
  const [map, setMap] = useState<google.maps.Map>();
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (data) {
      if (ref.current) {
        const center = { lat: data[0].lat, lng: data[0].lng };
        const map = new window.google.maps.Map(ref.current, {
          ...mapOptions,
          center,
        });
        setMap(map);
      }
    }
  }, [JSON.stringify(data)]);

  return (
    <>
      <div ref={ref} id="map" />
      {map && <Weather map={map} data={data} />}
    </>
  );
}

type WhetherProps = {
  map: any;
  data: Clusters | null;
};

function Weather({ map, data }: WhetherProps) {
  const [highlight, setHighlight] = useState("");

  const flattenedData = useMemo(() => {
    if (!data) return [];
    return getFlattenedData(data);
  }, [JSON.stringify(data)]);

  const polyLinesData = useMemo(() => {
    if (!flattenedData.length) return [];
    return getPolylinesData(flattenedData);
  }, [JSON.stringify(flattenedData)]);

  return (
    <>
      <PolyLine data={polyLinesData} map={map}/>
      {flattenedData.map((item) => {
        const key = item.type === "halt" ? item.start_time : item.datetime;
        return (
          <Marker
            key={key}
            map={map}
            position={{ lat: item.lat, lng: item.lng }}
            onClick={(e) => {
              
            }}
          >
            <Tooltip
              placement="top"
              title={
                <div className="popper-container">
                  <Typography>
                    Address:{" "}
                    <span className="popper-value">{item.address}</span>
                  </Typography>
                  {item.type === "halt" ? (
                    <>
                      <Typography sx={{ fontSize: "1rem" }}>
                        Start Time: <span className="popper-value">{item.start_time}</span>
                      </Typography>
                      <Typography>
                        End Time:{" "}
                        <span className="popper-value">{item.end_time}</span>
                      </Typography>
                    </>
                  ) : (
                    <Typography>
                      DateTime:{" "}
                      <span className="popper-value">{item.datetime}</span>
                    </Typography>
                  )}
                </div>
              }
              arrow
              componentsProps={{
                tooltip: {
                  sx: {
                    bgcolor: "common.white",
                    color: "common.black",
                    "& .MuiTooltip-arrow": {
                      color: "common.white",
                    },
                  },
                },
              }}
            >
              <div
                className={`marker ${item.type}`}
                style={{ background: item.color }}
              >
                {item.type === "halt" ? item.id : null}
              </div>
            </Tooltip>
          </Marker>
        );
      })}
    </>
  );
}

function Marker({ map, position, children, onClick }) {
  // @ts-ignore
  const rootRef = useRef();
  const markerRef = useRef();

  useEffect(() => {
    if (!rootRef.current) {
      const container = document.createElement("div");
      rootRef.current = createRoot(container);
      markerRef.current = new google.maps.marker.AdvancedMarkerView({
        position,
        content: container,
      });
    }

    return () => {
      markerRef.current.map = null;
    };
  }, []);

  useEffect(() => {
    rootRef.current.render(children);
    markerRef.current.position = position;
    markerRef.current.map = map;
    const listener = markerRef.current.addListener("click", onClick);
    return () => listener.remove();
  }, [map, position, children, onClick]);

  return <></>;
}
function PolyLine({ map, data }) {
  const polyRef = useRef();

  useEffect(() => {
    const flightPath = new google.maps.Polyline({
      path: data,
      geodesic: true,
      strokeColor: "#000000",
      strokeOpacity: 1,
      strokeWeight: 1,
      icons: [{
        icon: {path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW},
        offset: '100%',
        repeat: '80px'
      }]
    }); 


    flightPath.setMap(map);
  }, [map, JSON.stringify(data)]);

  return <></>;
}