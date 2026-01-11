import L from "leaflet";
import "leaflet-draw";

(L.Browser as { pointer?: boolean; msPointer?: boolean }).pointer = false;
(L.Browser as { pointer?: boolean; msPointer?: boolean }).msPointer = false;

(window as typeof window & { L: typeof L }).L = L;
