'use client'

import {
    useState,
    useRef,
    useEffect,
    useCallback,
    ChangeEvent,
    MouseEvent as ReactMouseEvent,
    TouchEvent as ReactTouchEvent,
} from 'react'
import { Upload, Download, RotateCcw, ZoomIn, ZoomOut, ImageIcon, CheckCircle2 } from 'lucide-react'
import { AnimateIn } from './ui/animate-in'

const CANVAS_SIZE = 1080

const PHOTO_BOX = {
    x: 326,
    y: 352,
    width: 428,
    height: 428,
}

function loadImg(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const img = new Image()
        img.onload = () => resolve(img)
        img.onerror = reject
        img.src = src
    })
}

function Step({ n, label, active, done }: { n: number; label: string; active: boolean; done: boolean }) {
    return (
        <div className="flex items-center gap-1.5">
            <span
                className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold transition-all duration-300"
                style={{
                    background: done || active ? 'var(--primary)' : 'transparent',
                    color: done || active ? '#000' : 'var(--muted-foreground)',
                    border: done || active ? 'none' : '1.5px solid var(--border)',
                }}
            >
                {done ? '✓' : n}
            </span>
            <span
                className="hidden text-xs font-semibold tracking-wide transition-colors duration-300 sm:inline"
                style={{ color: active ? 'var(--foreground)' : 'var(--muted-foreground)' }}
            >
                {label}
            </span>
        </div>
    )
}

export function DPGeneratorSection() {
    const canvasRef = useRef<HTMLCanvasElement>(null)

    const [userImage, setUserImage] = useState<HTMLImageElement | null>(null)
    const [frameImage, setFrameImage] = useState<HTMLImageElement | null>(null)
    const [frameError, setFrameError] = useState(false)

    const [scale, setScale] = useState(1)
    const [position, setPosition] = useState({ x: 0, y: 0 })
    const [defaultScale, setDefaultScale] = useState(1)
    const [defaultPos, setDefaultPos] = useState({ x: 0, y: 0 })

    const [isDragging, setIsDragging] = useState(false)
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 })

    const [downloading, setDownloading] = useState(false)
    const [downloaded, setDownloaded] = useState(false)

    const step = !userImage ? 1 : downloaded ? 3 : 2

    useEffect(() => {
        loadImg('/frame.png')
            .then(setFrameImage)
            .catch(() => setFrameError(true))
    }, [])

    const draw = useCallback(() => {
        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext('2d')
        if (!ctx) return

        // Clear canvas and fill with background
        ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE)
        ctx.fillStyle = '#050505'
        ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE)

        // Draw user image clipped to photo box
        if (userImage && userImage.complete && userImage.naturalHeight > 0) {
            try {
                ctx.save()
                ctx.beginPath()
                // Use roundRect if available, fallback to rect
                if (typeof ctx.roundRect === 'function') {
                    ctx.roundRect(PHOTO_BOX.x, PHOTO_BOX.y, PHOTO_BOX.width, PHOTO_BOX.height, 22)
                } else {
                    ctx.rect(PHOTO_BOX.x, PHOTO_BOX.y, PHOTO_BOX.width, PHOTO_BOX.height)
                }
                ctx.clip()
                
                // Draw the image with position offset applied within the clipped area
                ctx.drawImage(
                    userImage,
                    PHOTO_BOX.x + position.x,
                    PHOTO_BOX.y + position.y,
                    userImage.width * scale,
                    userImage.height * scale
                )
                ctx.restore()
            } catch (error) {
                console.error('Error drawing user image:', error)
            }
        }

        if (frameImage && !frameError && frameImage.complete && frameImage.naturalHeight > 0) {
            try {
                ctx.drawImage(frameImage, 0, 0, CANVAS_SIZE, CANVAS_SIZE)
            } catch (error) {
                console.error('Error drawing frame image:', error)
            }
        } else if (frameError) {
            ctx.save()
            ctx.globalAlpha = 0.18
            ctx.strokeStyle = '#FFB300'
            ctx.lineWidth = 36
            ctx.strokeRect(18, 18, CANVAS_SIZE - 36, CANVAS_SIZE - 36)
            ctx.restore()

            ctx.save()
            ctx.fillStyle = 'rgba(255,179,0,0.85)'
            ctx.font = 'bold 64px system-ui'
            ctx.textAlign = 'center'
            ctx.fillText('LASU TECH X 5.0', CANVAS_SIZE / 2, CANVAS_SIZE - 130)
            ctx.fillStyle = 'rgba(255,249,236,0.5)'
            ctx.font = '28px system-ui'
            ctx.fillText('Add frame.png to /public to continue', CANVAS_SIZE / 2, CANVAS_SIZE - 80)
            ctx.restore()
        }
    }, [userImage, frameImage, frameError, scale, position])

    useEffect(() => { draw() }, [draw])

    const handleUpload = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return
        if (!file.type.startsWith('image/')) {
            alert('Please upload a valid image (JPEG, PNG, WebP).')
            return
        }
        if (file.size > 20 * 1024 * 1024) {
            alert('Image must be under 20 MB.')
            return
        }
        const reader = new FileReader()
        reader.onload = (ev) => {
            loadImg(ev.target?.result as string).then((img) => {
                setUserImage(img)
                setDownloaded(false)
                // Scale to FIT inside the photo box (not fill - use Math.min instead of Math.max)
                // This ensures the image is smaller than or equal to the box dimensions
                const s = Math.min(PHOTO_BOX.width / img.width, PHOTO_BOX.height / img.height)
                // Center the image in the box
                const scaledWidth = img.width * s
                const scaledHeight = img.height * s
                const ix = (PHOTO_BOX.width - scaledWidth) / 2
                const iy = (PHOTO_BOX.height - scaledHeight) / 2
                setScale(s)
                setPosition({ x: ix, y: iy })
                setDefaultScale(s)
                setDefaultPos({ x: ix, y: iy })
            }).catch((err) => {
                console.error('Failed to load image:', err)
                alert('Failed to load image')
            })
        }
        reader.readAsDataURL(file)
        e.target.value = ''
    }

    const getRatio = () => {
        const canvas = canvasRef.current
        if (!canvas) return { rx: 1, ry: 1 }
        const r = canvas.getBoundingClientRect()
        return { rx: CANVAS_SIZE / r.width, ry: CANVAS_SIZE / r.height }
    }

    const getXY = (e: ReactMouseEvent<HTMLCanvasElement> | ReactTouchEvent<HTMLCanvasElement>) =>
        'touches' in e
            ? { cx: e.touches[0].clientX, cy: e.touches[0].clientY }
            : { cx: e.clientX, cy: e.clientY }

    const onPointerDown = (e: ReactMouseEvent<HTMLCanvasElement> | ReactTouchEvent<HTMLCanvasElement>) => {
        if (!userImage) return
        if ('touches' in e && e.cancelable) e.preventDefault()
        setIsDragging(true)
        const { cx, cy } = getXY(e)
        const { rx, ry } = getRatio()
        setDragStart({ x: cx * rx - position.x, y: cy * ry - position.y })
    }

    const onPointerMove = (e: ReactMouseEvent<HTMLCanvasElement> | ReactTouchEvent<HTMLCanvasElement>) => {
        if (!isDragging || !userImage) return
        if ('touches' in e && e.cancelable) e.preventDefault()
        const { cx, cy } = getXY(e)
        const { rx, ry } = getRatio()
        setPosition({ x: cx * rx - dragStart.x, y: cy * ry - dragStart.y })
    }

    const onPointerUp = () => setIsDragging(false)

    const onWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
        if (!userImage) return
        e.preventDefault()
        const d = e.deltaY > 0 ? -0.05 : 0.05
        setScale((s) => Math.max(defaultScale * 0.1, Math.min(defaultScale * 6, s + d * s)))
    }

    const handleReset = () => {
        setScale(defaultScale)
        setPosition(defaultPos)
    }

    const handleDownload = () => {
        const canvas = canvasRef.current
        if (!canvas) return
        setDownloading(true)
        requestAnimationFrame(() => {
            setTimeout(() => {
                const url = canvas.toDataURL('image/png', 1.0)
                const link = document.createElement('a')
                link.download = 'LASU-TECHX-5-DP.png'
                link.href = url
                link.click()
                setDownloading(false)
                setDownloaded(true)
            }, 80)
        })
    }

    return (
        <section id="dp-generator" className="section-pad bg-background border-t border-border">
            <div className="site-container">

                <AnimateIn from="bottom" className="mb-10 text-center">
                    <p className="mb-4 inline-flex items-center rounded-full border border-foreground/20 px-4 py-1 text-[10px] font-bold tracking-widest text-foreground/60 uppercase">
                        Event Profile Picture
                    </p>
                    <h2 className="text-display text-foreground text-3xl font-extrabold sm:text-5xl md:text-6xl">
                        Generate your LASU<br />
                        TECH<span className="text-primary">X</span> 5.0 DP
                    </h2>
                    <p className="text-muted-foreground mx-auto mt-4 max-w-xl text-sm leading-relaxed sm:text-base">
                        Upload your photo, fit it inside the official event frame, and share it with the world.
                        <br className="hidden sm:inline" />
                        Show everyone you&apos;ll be at LASU TECH X 5.0! 🔥
                    </p>
                </AnimateIn>

                <div className="grid gap-6 lg:grid-cols-[1fr_380px] lg:items-start">

                    <AnimateIn from="bottom">
                        <div className="card-surface overflow-hidden">

                            <div className="border-b border-border flex flex-wrap items-center justify-between gap-2 px-4 py-3 sm:px-5 sm:py-4">
                                <p className="text-xs font-bold tracking-widest text-muted-foreground uppercase">Preview</p>
                                <div className="flex items-center gap-2">
                                    <Step n={1} label="Upload" active={step === 1} done={step > 1} />
                                    <div className="h-px w-4 bg-border" />
                                    <Step n={2} label="Adjust" active={step === 2} done={step > 2} />
                                    <div className="h-px w-4 bg-border" />
                                    <Step n={3} label="Done" active={step === 3} done={false} />
                                </div>
                            </div>

                            <div className="p-4 sm:p-6">
                                <div
                                    className="relative mx-auto overflow-hidden rounded-xl"
                                    style={{
                                        width: '100%',
                                        maxWidth: 520,
                                        aspectRatio: '1/1',
                                        background: '#0F0F0F',
                                        border: userImage
                                            ? '1.5px solid rgba(255,179,0,0.35)'
                                            : '1.5px dashed rgba(255,255,255,0.10)',
                                        boxShadow: userImage ? '0 0 36px rgba(255,179,0,0.10)' : 'none',
                                        transition: 'border-color 0.3s, box-shadow 0.4s',
                                        cursor: isDragging ? 'grabbing' : userImage ? 'grab' : 'default',
                                        touchAction: 'none',
                                    }}
                                >
                                    {!userImage && (
                                        <label
                                            htmlFor="dp-photo-upload"
                                            className="absolute inset-0 z-10 flex cursor-pointer flex-col items-center justify-center gap-3"
                                        >
                                            <div
                                                className="flex h-14 w-14 items-center justify-center rounded-2xl"
                                                style={{ background: 'rgba(255,179,0,0.12)', border: '1px solid rgba(255,179,0,0.25)' }}
                                            >
                                                <ImageIcon className="h-6 w-6 text-primary" />
                                            </div>
                                            <div className="text-center">
                                                <p className="text-sm font-semibold text-foreground/70">Click to upload your photo</p>
                                                <p className="mt-1 text-xs text-muted-foreground">JPEG · PNG · WebP · up to 20 MB</p>
                                            </div>
                                        </label>
                                    )}

                                    <canvas
                                        ref={canvasRef}
                                        width={CANVAS_SIZE}
                                        height={CANVAS_SIZE}
                                        className="block h-full w-full"
                                        aria-label="DP preview canvas"
                                        onMouseDown={onPointerDown}
                                        onMouseMove={onPointerMove}
                                        onMouseUp={onPointerUp}
                                        onMouseLeave={onPointerUp}
                                        onTouchStart={onPointerDown}
                                        onTouchMove={onPointerMove}
                                        onTouchEnd={onPointerUp}
                                        onWheel={onWheel}
                                    />
                                </div>

                                {userImage && (
                                    <p className="mt-3 text-center text-[11px] font-medium tracking-wide text-muted-foreground">
                                        <span className="sm:hidden">Tap &amp; drag to reposition · Use slider to zoom</span>
                                        <span className="hidden sm:inline">Drag to reposition · Scroll or use slider to zoom</span>
                                    </p>
                                )}
                            </div>
                        </div>
                    </AnimateIn>

                    <AnimateIn from="bottom" delay={80}>
                        <div className="flex flex-col gap-5">

                            <div className="card-surface p-5 sm:p-6">
                                <p className="mb-1 text-[10px] font-bold tracking-widest text-muted-foreground uppercase">Step 1</p>
                                <p className="mb-4 text-sm font-semibold text-foreground">Upload your photo</p>
                                <label
                                    htmlFor="dp-photo-upload"
                                    className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-border bg-muted/30 px-5 py-4 text-sm font-semibold text-foreground transition-all hover:border-primary/40 hover:bg-primary/5"
                                >
                                    <Upload className="h-4 w-4 text-primary" />
                                    {userImage ? 'Change photo' : 'Choose image'}
                                    <input
                                        id="dp-photo-upload"
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        aria-label="Upload photo"
                                        onChange={handleUpload}
                                    />
                                </label>
                            </div>

                            {userImage && (
                                <div className="card-surface p-5 sm:p-6">
                                    <p className="mb-1 text-[10px] font-bold tracking-widest text-muted-foreground uppercase">Step 2</p>
                                    <p className="mb-5 text-sm font-semibold text-foreground">Adjust your photo</p>

                                    <div className="mb-5">
                                        <div className="mb-2.5 flex items-center justify-between">
                                            <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                                                <ZoomIn className="h-3.5 w-3.5" />
                                                Zoom
                                            </span>
                                            <span
                                                className="rounded-full px-2.5 py-0.5 text-[11px] font-bold text-black"
                                                style={{ background: 'var(--primary)' }}
                                            >
                                                {Math.round((scale / defaultScale) * 100)}%
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2.5">
                                            <ZoomOut className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                                            <input
                                                id="zoom-slider"
                                                type="range"
                                                aria-label="Zoom level"
                                                min={defaultScale * 0.1}
                                                max={defaultScale * 6}
                                                step={0.005}
                                                value={scale}
                                                onChange={(e) => setScale(parseFloat(e.target.value))}
                                                className="h-1.5 w-full appearance-none rounded-full outline-none"
                                                style={{
                                                    background: `linear-gradient(to right, var(--primary) 0%, var(--primary) ${((scale - defaultScale * 0.1) / (defaultScale * 5.9)) * 100}%, var(--border) ${((scale - defaultScale * 0.1) / (defaultScale * 5.9)) * 100}%, var(--border) 100%)`,
                                                    accentColor: 'var(--primary)',
                                                    cursor: 'pointer',
                                                }}
                                            />
                                            <ZoomIn className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                                        </div>
                                    </div>

                                    <button
                                        id="reset-position-btn"
                                        type="button"
                                        onClick={handleReset}
                                        className="flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-transparent px-5 py-3 text-sm font-semibold text-foreground/70 transition-all hover:border-foreground/20 hover:text-foreground"
                                    >
                                        <RotateCcw className="h-4 w-4" />
                                        Reset position &amp; zoom
                                    </button>
                                </div>
                            )}

                            {userImage && (
                                <div className="card-surface p-5 sm:p-6">
                                    <p className="mb-1 text-[10px] font-bold tracking-widest text-muted-foreground uppercase">Step 3</p>
                                    <p className="mb-4 text-sm font-semibold text-foreground">Download your DP</p>

                                    {frameError && (
                                        <div
                                            className="mb-4 rounded-xl border px-4 py-3 text-xs font-medium"
                                            style={{ background: 'rgba(251,188,4,0.08)', border: '1px solid rgba(251,188,4,0.25)', color: '#FBBC04' }}
                                        >
                                            ⚠️ <strong>frame.png</strong> not found in <code>/public</code>. Add it and refresh to use the real event frame.
                                        </div>
                                    )}

                                    <button
                                        id="download-dp-btn"
                                        type="button"
                                        onClick={handleDownload}
                                        disabled={downloading}
                                        className="flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3.5 text-sm font-bold text-black transition-all hover:scale-[1.02] hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed"
                                        style={{
                                            background: downloaded ? '#34A853' : 'var(--primary)',
                                            boxShadow: downloaded
                                                ? '0 0 24px rgba(52,168,83,0.3)'
                                                : '0 0 24px rgba(255,179,0,0.25)',
                                        }}
                                    >
                                        {downloading ? (
                                            <>
                                                <span
                                                    className="h-4 w-4 rounded-full border-2 border-black/30 border-t-black"
                                                    style={{ animation: 'spin 0.8s linear infinite', display: 'inline-block' }}
                                                />
                                                Generating…
                                            </>
                                        ) : downloaded ? (
                                            <>
                                                <CheckCircle2 className="h-4 w-4" />
                                                Downloaded!
                                            </>
                                        ) : (
                                            <>
                                                <Download className="h-4 w-4" />
                                                Download DP · 1080×1080 PNG
                                            </>
                                        )}
                                    </button>

                                    {downloaded && (
                                        <p className="mt-3 text-center text-xs text-muted-foreground">
                                            Share it everywhere and tag us! 🚀
                                        </p>
                                    )}
                                </div>
                            )}

                            <p className="px-1 text-[11px] leading-relaxed text-muted-foreground">
                                🔒 Your photo never leaves your device — all processing happens locally in your browser.
                            </p>
                        </div>
                    </AnimateIn>
                </div>

                <AnimateIn from="bottom" delay={120} className="mt-10 sm:mt-12">
                    <div
                        className="rounded-2xl border border-border px-5 py-7 text-center sm:rounded-3xl sm:px-6 sm:py-10"
                        style={{ background: 'var(--card)' }}
                    >
                        <p className="text-display text-foreground text-xl font-extrabold sm:text-3xl md:text-4xl">
                            I will be at LASU TECH<span className="text-primary">X</span> 5.0 🚀
                        </p>
                        <p className="mt-2 text-xs text-muted-foreground sm:text-sm">
                            Join thousands of tech enthusiasts · Lagos State University, Ojo &amp; Epe
                        </p>
                    </div>
                </AnimateIn>

            </div>

            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </section>
    )
}
