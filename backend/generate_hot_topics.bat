@echo off
echo Starting Batch Generation of Series 4 Mechanics...

echo Generating Topic 33: Tech Unicorns
call node mockGenerator.js "Tech Unicorns HK" "Reading"

echo Generating Topic 34: Net-Zero School Movement
call node mockGenerator.js "Net-Zero School Movement" "Reading"

echo Generating Topic 35: Indoor Air Quality and Health
call node mockGenerator.js "Indoor Air Quality and Health" "Reading"

echo Generating Topic 36: West Kowloon Art Boom
call node mockGenerator.js "West Kowloon Art Boom" "Reading"

echo Generating Topic 37: Student Wellbeing
call node mockGenerator.js "Student Wellbeing" "Reading"

echo Generating Topic 38: Vibe Hong Kong Mega Events
call node mockGenerator.js "Vibe Hong Kong Mega Events" "Reading"

echo Generating Topic 39: Public Safety vs Personal Liberty
call node mockGenerator.js "Public Safety vs Personal Liberty" "Reading"

echo Generating Topic 40: The Smoke-Free City
call node mockGenerator.js "The Smoke-Free City" "Reading"

echo.
echo ===========================================
echo ALL MOCKS GENERATED SUCCESSFULLY!
echo ===========================================
