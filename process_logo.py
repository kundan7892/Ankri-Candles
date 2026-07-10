import os
import sys

try:
    from PIL import Image
except ImportError:
    import subprocess
    subprocess.check_call([sys.executable, "-m", "pip", "install", "pillow"])
    from PIL import Image

def process_logo():
    input_path = r"C:\Users\Krishna\.gemini\antigravity\brain\2a13ea39-4094-4fbf-a595-026ce1a30801\ankri_candles_logo_1783663955882.png"
    output_path1 = r"c:\Ankri Candle\ankri_candles_logo.png"
    output_path2 = r"c:\Ankri Candle\dist\ankri_candles_logo.png"

    if not os.path.exists(input_path):
        print(f"Error: input file {input_path} does not exist.")
        return

    img = Image.open(input_path).convert("RGBA")
    width, height = img.size
    pixels = img.load()

    # Process pixels to make background transparent
    for y in range(height):
        for x in range(width):
            r, g, b, a = pixels[x, y]
            # White or near-white background pixel -> fully transparent
            if r > 240 and g > 240 and b > 240:
                pixels[x, y] = (0, 0, 0, 0)
            else:
                # Keep all original colors (e.g., dark green text and gold flame)
                # Ensure they have full opacity
                pixels[x, y] = (r, g, b, 255)

    img.save(output_path1, "PNG")
    img.save(output_path2, "PNG")
    print("Logo processed with transparency successfully and saved.")

if __name__ == "__main__":
    process_logo()
