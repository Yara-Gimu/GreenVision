import json
import os
from PIL import Image
from PIL.ExifTags import TAGS, GPSTAGS
import requests
from io import BytesIO
from datetime import datetime
import zipfile
import tempfile
from pathlib import Path
import base64

# Load plant database
data_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'data.json')
with open(data_path, 'r', encoding='utf-8') as f:
    PLANT_DATABASE = json.load(f)

def extract_gps_from_image(image_path):
    """Extract GPS coordinates from image EXIF data"""
    try:
        image = Image.open(image_path)
        exif_data = image._getexif()
        
        if not exif_data:
            return None, None
        
        gps_info = {}
        for tag, value in exif_data.items():
            tag_name = TAGS.get(tag, tag)
            if tag_name == "GPSInfo":
                for gps_tag in value:
                    sub_tag = GPSTAGS.get(gps_tag, gps_tag)
                    gps_info[sub_tag] = value[gps_tag]
        
        if 'GPSLatitude' in gps_info and 'GPSLongitude' in gps_info:
            # Convert GPS coordinates to decimal degrees
            lat = gps_info['GPSLatitude']
            lon = gps_info['GPSLongitude']
            
            lat_ref = gps_info.get('GPSLatitudeRef', 'N')
            lon_ref = gps_info.get('GPSLongitudeRef', 'E')
            
            # Convert from degrees, minutes, seconds to decimal
            # استخدام float() لتحويل Fraction objects إلى float (حل مشكلة JSON serialization)
            lat_decimal = float(lat[0] + lat[1]/60 + lat[2]/3600)
            if lat_ref == 'S':
                lat_decimal = -lat_decimal
                
            lon_decimal = float(lon[0] + lon[1]/60 + lon[2]/3600)
            if lon_ref == 'W':
                lon_decimal = -lon_decimal
            
            return lat_decimal, lon_decimal
        
        return None, None
    except Exception as e:
        print(f"Error extracting GPS: {e}")
        return None, None

def analyze_image_with_ai(image_path, openrouter_api_key):
    """Analyze image using OpenRouter API with image optimization"""
    try:
        # 1. Open and Optimize Image
        with Image.open(image_path) as img:
            # Convert to RGB if needed (removes transparency issues)
            if img.mode in ('RGBA', 'P', 'L'):
                img = img.convert('RGB')
            
            # Resize logic: Max dimension 1024px to save bandwidth and speed up AI
            # This significantly reduces file size without losing plant identification capability
            img.thumbnail((1024, 1024), Image.Resampling.LANCZOS)
            
            # Save to buffer with optimized quality
            buffered = BytesIO()
            img.save(buffered, format="JPEG", quality=85, optimize=True)
            image_base64 = base64.b64encode(buffered.getvalue()).decode('utf-8')
        
        # 2. Prepare the prompt
        prompt = """You are an expert Botanist and Ecologist specializing in the flora of Saudi Arabia and the Middle East.
Your specific expertise is identifying Invasive Alien Plant Species (IAPS), Native Saudi Species, and Exotic/Ornamental plants.

Analyze the attached image strictly to identify plants. Focus on detecting:
1. Invasive plants (e.g., Prosopis juliflora/Mesquite, Argemone ochroleuca, Opuntia, Nicotiana glauca, Parthenium hysterophorus, Xanthium strumarium, etc.).
2. Native plants (e.g., Acacia gerrardii, Ziziphus spina-christi, Rhazya stricta, Rhanterium epapposum, Astragalus spp., etc.).
3. Exotic/Ornamental plants (decorative plants not native but not invasive, e.g., Bougainvillea, Ficus, ornamental grasses, etc.).

CRITICAL INSTRUCTIONS:
- If the image contains 'Prosopis juliflora' (مسكيت/Mesquite), differentiate it carefully from native Acacias. Prosopis has feathery compound leaves and long seed pods.
- Provide the exact Scientific Name in Latin.
- Pay special attention to leaf morphology, thorns, flowers, and pod structure.
- If uncertain, indicate lower confidence value.

Respond ONLY in valid JSON format (no markdown or text outside JSON):
{
    "is_plant": boolean,
    "analysis": {
        "contains_plants": boolean,
        "plants_detected": [{
            "scientific_name": "Latin binomial name",
            "common_name_ar": "Arabic name if known",
            "count": integer,
            "status": "invasive" or "native" or "exotic" or "unknown",
            "confidence": float (0.0 to 1.0),
            "visual_description": "Why you identified it (e.g., feathery leaves, yellow flowers, thorns, seed pods)",
            "removal_methods": "If invasive: relevant removal/control methods (herbicides, manual removal, prescribed burning, etc.)",
            "ecological_role": "If native: ecological role/importance in the ecosystem"
        }],
        "total_plant_count": integer,
        "image_description": "Environment description (e.g., desert, wadi, cultivated area, urban)"
    }
}

Rules:
- If no plants: set "is_plant": false
- For multiple plants: list ALL detected species
- Always use scientific names
- Confidence should reflect your certainty (0.0-1.0)
- Status options: "invasive" (غازي), "native" (محلي), "exotic" (دخيلة/زينة), "unknown" (غير معروف)"""
        
        # 3. Make API call to OpenRouter
        headers = {
            "Authorization": f"Bearer {openrouter_api_key}",
            "Content-Type": "application/json",
            "HTTP-Referer": "http://localhost:8000",
            "X-Title": "GreenVision"
        }
        
        # 4. Use a valid model name from available options
        payload = {
            "model": os.getenv("AI_MODEL", "google/gemini-2.0-flash-001"),
            "messages": [
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": prompt
                        },
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:image/jpeg;base64,{image_base64}"
                            }
                        }
                    ]
                }
            ],
            "response_format": {"type": "json_object"}
        }
        
        response = requests.post(
            "https://openrouter.ai/api/v1/chat/completions",
            headers=headers,
            json=payload,
            timeout=120
        )
        
        # 5. Handle response
        if response.status_code == 200:
            result = response.json()
            analysis_text = result['choices'][0]['message']['content']
            return json.loads(analysis_text)
        else:
            # Print detailed error information for debugging
            error_msg = response.text
            print(f"⚠️ API Error {response.status_code}")
            print(f"Response: {error_msg}")
            try:
                error_data = response.json()
                print(f"Error details: {error_data}")
            except:
                pass
            
            return {
                "is_plant": False,
                "analysis": {
                    "contains_plants": False,
                    "plants_detected": [],
                    "total_plant_count": 0,
                    "image_description": f"Error analyzing image (Status: {response.status_code})"
                }
            }
    except Exception as e:
        import traceback
        print(f"✗ Exception in analyze_image_with_ai: {e}")
        print(f"  Traceback: {traceback.format_exc()}")
        return {
            "is_plant": False,
            "analysis": {
                "contains_plants": False,
                "plants_detected": [],
                "total_plant_count": 0,
                "image_description": f"Exception: {str(e)}"
            }
        }
            
    except Exception as e:
        print(f"Error in AI analysis: {e}")
        return {
            "is_plant": False,
            "analysis": {
                "contains_plants": False,
                "plants_detected": [],
                "total_plant_count": 0,
                "image_description": f"Analysis error: {str(e)}"
            }
        }

def enrich_plant_data(ai_analysis):
    """Enrich AI analysis with data from local database"""
    enriched_analysis = ai_analysis.copy()
    
    if not ai_analysis.get("is_plant", False):
        return enriched_analysis
    
    plants_detected = ai_analysis.get("analysis", {}).get("plants_detected", [])
    
    for plant in plants_detected:
        scientific_name = plant.get("scientific_name", "").lower()
        ai_status = plant.get("status", "unknown")  # Get AI's classification
        
        # Check invasive plants
        invasive_match = next(
            (p for p in PLANT_DATABASE["invasive_plants"] 
             if p["scientific_name"].lower() == scientific_name),
            None
        )
        
        if invasive_match:
            plant["enriched_data"] = {
                "common_name_ar": invasive_match.get("type", ""),
                "removal_methods": invasive_match.get("description", ""),
                "danger_level": invasive_match.get("danger_level", ""),
                "ecological_impact": invasive_match.get("description", ""),
                "type": "invasive",
                "source": "local_database"
            }
            continue
        
        # Check native plants
        native_match = next(
            (p for p in PLANT_DATABASE["native_saudi_plants"] 
             if p["scientific_name"].lower() == scientific_name),
            None
        )
        
        if native_match:
            plant["enriched_data"] = {
                "common_name_ar": native_match.get("arabic_name", ""),
                "habitat": native_match.get("habitat", ""),
                "ecological_role": native_match.get("ecological_role", ""),
                "conservation_status": native_match.get("type", ""),
                "type": "native",
                "source": "local_database"
            }
            continue
        
        # If not found in local database, use AI status to determine type
        if ai_status == "invasive":
            plant["enriched_data"] = {
                "type": "invasive",
                "source": "ai_analysis",
                "removal_methods": plant.get("removal_methods", "من الذكاء الاصطناعي"),
                "note": "Identified by AI as invasive plant"
            }
        elif ai_status == "native":
            plant["enriched_data"] = {
                "type": "native",
                "source": "ai_analysis",
                "ecological_role": plant.get("ecological_role", "من الذكاء الاصطناعي"),
                "note": "Identified by AI as native plant"
            }
        elif ai_status == "exotic":
            plant["enriched_data"] = {
                "type": "exotic",
                "common_name_ar": plant.get("common_name_ar", ""),
                "source": "ai_analysis",
                "note": "Identified by AI as exotic/ornamental plant (دخيل أو زينة)"
            }
        else:
            plant["enriched_data"] = {
                "type": "unknown",
                "source": "ai_analysis",
                "note": "Plant classification unknown"
            }
    
    return enriched_analysis

def process_image(image_path, openrouter_api_key):
    """Full processing pipeline for a single image"""
    # Extract GPS
    latitude, longitude = extract_gps_from_image(image_path)
    
    # Analyze with AI
    ai_result = analyze_image_with_ai(image_path, openrouter_api_key)
    
    # Enrich with local data
    enriched_result = enrich_plant_data(ai_result)
    
    # Prepare final result
    result = {
        "gps": {
            "latitude": latitude,
            "longitude": longitude,
            "has_coordinates": latitude is not None and longitude is not None
        },
        "analysis": enriched_result,
        "filename": os.path.basename(image_path)
    }
    
    return result

def process_zip_file(zip_path, openrouter_api_key):
    """Process all images in a ZIP file"""
    results = []
    temp_dir = tempfile.mkdtemp()
    
    try:
        with zipfile.ZipFile(zip_path, 'r') as zip_ref:
            zip_ref.extractall(temp_dir)
        
        # Get all image files
        image_extensions = ['.jpg', '.jpeg', '.png', '.bmp', '.gif', '.tiff']
        for root, dirs, files in os.walk(temp_dir):
            for file in files:
                if any(file.lower().endswith(ext) for ext in image_extensions):
                    image_path = os.path.join(root, file)
                    result = process_image(image_path, openrouter_api_key)
                    results.append(result)
    
    except Exception as e:
        print(f"Error processing ZIP: {e}")
    
    finally:
        # Clean up temporary directory
        import shutil
        shutil.rmtree(temp_dir, ignore_errors=True)
    
    return results