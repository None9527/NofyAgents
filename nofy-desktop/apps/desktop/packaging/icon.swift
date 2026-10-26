// Rasterize the existing renderer IconMark (hexagon + center ring), not a second logo.
import AppKit
let path = CommandLine.arguments[1]
let image = NSImage(size: NSSize(width: 1024, height: 1024))
image.lockFocus()
NSColor(calibratedRed: 0.09, green: 0.09, blue: 0.09, alpha: 1).setFill()
NSBezierPath(roundedRect: NSRect(x: 32, y: 32, width: 960, height: 960), xRadius: 212, yRadius: 212).fill()
let mark = NSBezierPath()
// Original 24px IconMark coordinates, scaled to 680px and centered. AppKit Y axis points up.
func point(_ x: CGFloat, _ y: CGFloat) -> NSPoint { NSPoint(x: 172 + x * 680 / 24, y: 852 - y * 680 / 24) }
mark.move(to: point(12, 2.5))
for p in [(20.0, 7.0), (20.0, 17.0), (12.0, 21.5), (4.0, 17.0), (4.0, 7.0)] { mark.line(to: point(p.0, p.1)) }
mark.close()
mark.lineWidth = 44
mark.lineJoinStyle = .round
NSColor.white.setStroke()
mark.stroke()
let circle = NSBezierPath(ovalIn: NSRect(x: 441.17, y: 441.17, width: 141.66, height: 141.66))
circle.lineWidth = 44
circle.stroke()
image.unlockFocus()
let data = image.tiffRepresentation!
let bitmap = NSBitmapImageRep(data: data)!
try bitmap.representation(using: .png, properties: [:])!.write(to: URL(fileURLWithPath: path))
