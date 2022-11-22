public class Utility {
    public static int productionCoef = 10;
    public static float speed = 2;
    public static String neutralColor = "null";

    public static String getOtherColor(String color) {
        return (color.equals("blue")) ? "red" : "blue";
    }

    public static String createAttack(Planet originPlanet, Planet destinatioPlanet) {
        return "A " // attack
                + originPlanet.name // from 
                + " "
                + destinatioPlanet.name // to
                + "\n";
    }
    
    public static int numberOfTurns(Planet planet1, Planet planet2) {
        return (int) (distance(planet1, planet2) / speed);
    }
    
    public static double distance(Planet planet1, Planet planet2) {
        return Math.sqrt(Math.pow(planet1.posX - planet2.posX, 2) 
                + Math.pow(planet1.posY - planet2.posY, 2));
    }
}