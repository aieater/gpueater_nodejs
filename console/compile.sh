echo "--------------------------------------------"
echo "Compile"
EXENAME=gpueater_`uname`
npm install
nexe -o $EXENAME  --build -p /usr/bin/python --make ['--jobs=4']
echo "$EXENAME stand alone execution test."
echo ""
./$EXENAME version
